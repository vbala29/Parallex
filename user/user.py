import grpc
import user_pb2_grpc
import user_pb2
import urllib.request


def SendJob():
    channel = grpc.insecure_channel('localhost:50051')
    stub = user_pb2_grpc.JobStub(channel)
    """
    string IP = 1;
    """
    clientIP = urllib.request.urlopen('http://ident.me').read().decode('utf8')
    response = stub.SendJob(user_pb2.JobMetrics(clientIP=clientIP, cpuCount = 1, memoryCount = 2048))
    print("Job sent, got response: ")
    print(response)


if __name__ == '__main__':
    SendJob()
    
