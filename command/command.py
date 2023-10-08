from concurrent import futures

import grpc
from protos.provider_command_protos import daemon_pb2
from protos.provider_command_protos import daemon_pb2_grpc

class Daemon(daemon_pb2_grpc.MetricsServicer):
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

def serve():
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    daemon_pb2_grpc.add_MetricsServicer_to_server(Daemon(), server)
    server.add_insecure_port('[::]:' + port)
    server.start()
    print("Server started on port " + port)
    server.wait_for_termination()

if __name__ == '__main__':
    serve()