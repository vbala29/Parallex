import grpc
import urllib.request

from protos.build import user_pb2_grpc
from protos.build import user_pb2


def SendJob():
    channel = grpc.insecure_channel("127.0.0.1:50051")
    grpc.channel_ready_future(channel).result()
    stub = user_pb2_grpc.JobStub(channel)

    print("Created stub")

    clientIP = urllib.request.urlopen("http://ident.me").read().decode("utf8")
    headNode = stub.SendJob(
        user_pb2.JobMetrics(clientIP=clientIP, cpuCount=1, memoryCount=2048)
    )
    print(f"Job sent, got headIP: {headNode.headIP}")


if __name__ == "__main__":
    SendJob()
