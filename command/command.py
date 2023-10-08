from concurrent import futures
import time

import grpc
from protos.provider_command_protos import daemon_pb2
from protos.provider_command_protos import daemon_pb2_grpc

class Provider():
    def __init__(self, ip):
        self.ip = ip
        self.last_seen = time.time()

class CommandNode():
    def __init__(self):
        self.providers = {}

    def add_provider(self, provider):
        self.providers[provider.name] = provider

class DaemonHandler(daemon_pb2_grpc.MetricsServicer):

    
    def SendStaticMetrics(self, request, context):
        print("Received static metrics")
        print(request)
        print(context)
        return daemon_pb2.Empty()
    
    def SendDynamicMetrics(self, request, context):
        print("Received dynamic metrics")
        print(request)
        print(context)
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