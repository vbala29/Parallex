import time
import requests
import ipinfo
import grpc
import geopy.distance
from protos.provider_command_protos import daemon_pb2
from protos.provider_command_protos import daemon_pb2_grpc
from protos.user_command_protos import user_pb2
from protos.user_command_protos import user_pb2_grpc
from collections import defaultdict
from concurrent import futures


class Provider():

    def __init__(self, ip, uuid):
        self.ip = ip
        self.last_seen = time.time()
        self.static_metrics = {}
        self.dynamic_metrics = {}
        self.uuid = uuid
        self.job_queue = []

    def update_static_metrics(self, static_metrics):
        self.static_metrics = static_metrics
        self.last_seen = time.time()

    def update_dynamic_metrics(self, dynamic_metrics):
        self.dynamic_metrics = dynamic_metrics
        self.last_seen = time.time()

    def parse_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]

    def __str__(self):
        return "Provider uuid: {}, ip: {}, lat: {}, lon: {}".format(self.uuid, self.ip, self.lat, self.lon)

    def __repr__(self):
        return "Provider uuid: {}, ip: {}, lat: {}, lon: {}".format(self.uuid, self.ip, self.lat, self.lon)

    
class Job():

    def __init__(self, ip):
        self.ip = ip

    def parse_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]

class ProviderCandidate():
    def __init__(self, provider, distance, ramCountAvailable, cpuCountAvailable):
        self.provider = provider
        self.distance = distance
        self.ramCountAvailable = ramCountAvailable
        self.cpuCountAvailable = cpuCountAvailable
    
    def __lt__(self, other):
        if self.cpuCountAvailable < other.cpuCountAvailable:
            return True
        elif self.cpuCountAvailable == other.cpuCountAvailable:
            if self.ramCountAvailable < other.ramCountAvailable:
                return True
            elif self.ramCountAvailable == other.ramCountAvailable:
                if self.distance < other.distance:
                    return True
                else:
                    return False
            else:
                return False
        else:
            return False
    
    def __eq__(self, other):
        if self.cpuCountAvailable == other.cpuCountAvailable and self.ramCountAvailable == other.ramCountAvailable and self.distance == other.distance:
            return True
        else:
            return False

class CommandNode():
    def __init__(self):
        self.providers = defaultdict(dict)

    def add_provider(self, provider, uuid):
        self.providers[provider.ip][uuid] = provider

    def select_providers(self, user_location, requiredCPU, requiredMemory):  # user location is a tuple (lat, lon)
        best_candidate_providers = []
        for ip in self.providers:
            for uuid in self.providers[ip]:
                provider = self.providers[ip][uuid]
                cpuCountAvailable = provider.static_metrics["CPUNumCores"]
                ramCountAvailable = provider.static_metrics["MiBRam"]
                # use geopy.distance.distance() to calculate distance
                distance = geopy.distance.distance((provider.lat, provider.lon),
                                                   user_location).km
                best_candidate_providers.append(ProviderCandidate(provider, distance, 
                                            ramCountAvailable, cpuCountAvailable))
        best_candidate_providers.sort()
        providers = []
        totalCPU = 0
        totalMemory = 0
        while (totalCPU < requiredCPU and totalMemory < requiredMemory):
            if len(best_candidate_providers) == 0:
                break
            p = best_candidate_providers.pop()
            providers.append(p.provider)
            totalCPU += p.cpuCountAvailable
            totalMemory += p.ramCountAvailable

        print("providers sorted: ".format(providers))
        return providers

def findLocation(p):
    f = open("../access_tokens/ipinfo", "r")
    access_token = f.read().strip()
    handler = ipinfo.getHandler(access_token)
    ip_address = p.ip
    details = handler.getDetails(ip_address)
    p.parse_location(details.loc)

class DaemonHandler(daemon_pb2_grpc.MetricsServicer):

    def __init__(self, cm):
        self.cm = cm

    def SendStaticMetrics(self, request, context):
        ip = request.clientIP
        if (ip not in self.cm.providers) or (request.uuid not in self.cm.providers[ip]):
            print(
                "Received static metrics from unknown provider: {}".format(request.uuid))
            p = Provider(ip=ip, uuid = request.uuid)
            self.cm.add_provider(p, request.uuid)
            findLocation(p)

        else:
            print("Received static metrics from known provider: {}".format(request.uuid))
            p = self.cm.providers[ip][request.uuid]

        p.update_static_metrics({
            "CPUNumCores": request.CPUNumCores,
            "CPUName": request.CPUName,
            "MiBRam": request.MiBRam
        })

        return daemon_pb2.Empty()

    def SendDynamicMetrics(self, request_iter, context):
        for request in request_iter:
            ip = request.clientIP
            if ip not in self.cm.providers:
                print(
                    "Received dynamic metrics from unknown provider: {}".format(request.uuid))
            else:
                print("Received dynamic metrics from known provider: {}".format(request.uuid))
                p = self.cm.providers[ip][request.uuid]
                p.update_dynamic_metrics({
                    "CPUUsage": request.CPUUsage,
                    "MiBRamUsage": request.MiBRamUsage,
                })
            
            # Check provider queue for waiting job clusters to join
            for provider in self.cm.providers:
                for uuid in self.cm.providers[provider]:
                    p = self.cm.providers[provider][uuid]
                    while len(p.job_queue) > 0:
                        job = p.job_queue.pop()
                        yield daemon_pb2.JobClusterRequest(headIP=job.ip)


class JobHandler(user_pb2_grpc.JobServicer):

    def __init__(self, cm):
        self.cm = cm

    def SendJob(self, request, context):
        ip = request.clientIP
        cpuCount = request.cpuCount
        memoryCount = request.memoryCount
        job = Job(ip)
        findLocation(job)
        print("Received a job from IP: {}".format(ip))
        providers = cm.select_providers((job.lat, job.lon), cpuCount, memoryCount)
        print("{} providers selected".format(len(providers)))
        print("providers nodes selected for job: {}".format(providers))
        return user_pb2.Empty()
    
    # def duringJobFunction


def serve(cm):
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    daemon_pb2_grpc.add_MetricsServicer_to_server(DaemonHandler(cm), server)
    user_pb2_grpc.add_JobServicer_to_server(JobHandler(cm), server)
    server.add_insecure_port('[::]:' + port)
    server.start()
    print("Server started on port " + port)
    server.wait_for_termination()


if __name__ == '__main__':
    cm = CommandNode()
    serve(cm)
