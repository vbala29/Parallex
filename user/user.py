import grpc
import urllib.request

import user_pb2_grpc
import user_pb2

def SendJob():
    channel = grpc.insecure_channel('localhost:50051')
    stub = user_pb2_grpc.JobStub(channel)

    clientIP = urllib.request.urlopen('http://ident.me').read().decode('utf8')
    headNode = stub.SendJob(user_pb2.JobMetrics(clientIP=clientIP, cpuCount = 1, memoryCount = 2048))
    print("Job sent, got headIP: {}".format(headNode.headIP))

if __name__ == '__main__':
    SendJob()
    
