from concurrent import futures
import time
import requests
import ipinfo
import grpc
from protos.provider_command_protos import daemon_pb2
from protos.provider_command_protos import daemon_pb2_grpc


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
    
    def find_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]


class CommandNode():

    def __init__(self):
        self.providers = {}

    def add_provider(self, provider):
        self.providers[provider.ip] = provider


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
        p.find_location(details.loc)

    def SendStaticMetrics(self, request, context):
        print("Received static metrics")
        ip = request.clientIP
        if ip not in self.cm.providers:
            print(
                "Received static metrics from unknown provider: {}".format(ip))
            p = Provider(ip=ip)
            self.cm.add_provider(p)
            DaemonHandler.FindProviderLocation(p)

        else:
            p = self.cm.providers[ip]

        p.update_static_metrics({
            "CPUNumCores": request.CPUNumCores,
            "CPUName": request.CPUName,
            "MiBRam": request.MiBRam
        })

        return daemon_pb2.Empty()

    def SendDynamicMetrics(self, request, context):
        print("Received dynamic metrics")
        ip = request.clientIP

        if ip not in self.cm.providers:
            print(
                "Received dynamic metrics from unknown provider: {}".format(ip))
        else:
            p = self.cm.providers[ip]
            p.update_dynamic_metrics({
                "CPUUsage": request.CPUUsage,
                "MiBRamUsage": request.MiBRamUsage
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
