import time
import requests
import ipinfo
import grpc
import geopy.distance
from protos.provider_command_protos import daemon_pb2
from protos.provider_command_protos import daemon_pb2_grpc
from collections import defaultdict
from concurrent import futures


class Provider():

    def __init__(self, ip):
        self.ip = ip
        self.last_seen = time.time()
        self.static_metrics = {}
        self.dynamic_metrics = {}

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


class CommandNode():

    def __init__(self):
        self.providers = defaultdict(dict)

    def add_provider(self, provider, uuid):
        self.providers[provider.ip][uuid] = provider

    def select_providers(self, num, user_location): # user location is a tuple (lat, lon)
        providers_by_distance = []
        for ip in self.providers:
            for uuid in self.providers[ip]:
                provider = self.providers[ip][uuid]
                # use geopy.distance.distance() to calculate distance
                distance = geopy.distance.distance(
                    (provider.lat, provider.lon), user_location).km
                providers_by_distance.append((provider, distance))
        providers_by_distance.sort(key=lambda x: x[1])
        return providers_by_distance[:num]


class DaemonHandler(daemon_pb2_grpc.MetricsServicer):

    def __init__(self, cm):
        self.cm = cm

    @staticmethod
    def FindProviderLocation(p):
        f = open("../access_tokens/ipinfo", "r")
        access_token = f.read().strip()
        handler = ipinfo.getHandler(access_token)
        ip_address = p.ip
        details = handler.getDetails(ip_address)
        p.parse_location(details.loc)

    def SendStaticMetrics(self, request, context):
        ip = request.clientIP
        if ip not in self.cm.providers:
            print(
                "Received static metrics from unknown provider: {}".format(ip))
            p = Provider(ip=ip)
            self.cm.add_provider(p, request.uuid)
            DaemonHandler.FindProviderLocation(p)

        else:
            print("Received static metrics from known provider: {}".format(ip))
            p = self.cm.providers[ip][request.uuid]

        p.update_static_metrics({
            "CPUNumCores": request.CPUNumCores,
            "CPUName": request.CPUName,
            "MiBRam": request.MiBRam
        })

        return daemon_pb2.Empty()

    def SendDynamicMetrics(self, request, context):
        ip = request.clientIP
        if ip not in self.cm.providers:
            print(
                "Received dynamic metrics from unknown provider: {}".format(ip))
        else:
            print("Received dynamic metrics from known provider: {}".format(ip))
            p = self.cm.providers[ip][request.uuid]
            p.update_dynamic_metrics({
                "CPUUsage": request.CPUUsage,
                "MiBRamUsage": request.MiBRamUsage,
            })
        return daemon_pb2.Empty()


def serve(cm):
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    daemon_pb2_grpc.add_MetricsServicer_to_server(DaemonHandler(cm), server)
    server.add_insecure_port('[::]:' + port)
    server.start()
    print("Server started on port " + port)
    server.wait_for_termination()


if __name__ == '__main__':
    cm = CommandNode()
    serve(cm)

