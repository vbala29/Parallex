import os
import platform

import grpc
import daemon_pb2_grpc
import daemon_pb2


def sendStaticMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    int32 CPUNumCores = 1;
    string CPUName = 2;
    int32 MBRam = 3;
    """
    #dummy data for now
    CPUNumCores = os.cpu_count()
    CPUName = platform.processor()
    MBRam = 1024
    response = stub.SendStaticMetrics(daemon_pb2.StaticMetrics(CPUNumCores=CPUNumCores, CPUName=CPUName, MBRam=MBRam))
    print(response)

def sendDynamicMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    int32 CPUUsage = 1;
    int32 RamUsage = 2;
    """
    #dummy data for now
    RamUsage = 50
    CPUUsage = 50
    response = stub.SendDynamicMetrics(daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage, RamUsage=RamUsage))
    print(response)

if __name__ == '__main__':
    sendStaticMetrics()
    sendDynamicMetrics()
