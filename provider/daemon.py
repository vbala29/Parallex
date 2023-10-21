import psutil
from cpuinfo import get_cpu_info

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
    CPUNumCores = psutil.cpu_count(logical=True)
    cpu_info = get_cpu_info()
    CPUName = cpu_info['brand_raw'] + " " + cpu_info['arch']
    MiBRam = psutil.virtual_memory().total / (2^20)
    response = stub.SendStaticMetrics(daemon_pb2.StaticMetrics(CPUNumCores=CPUNumCores, CPUName=CPUName, MiBRam=MiBRam))

def sendDynamicMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    int32 CPUUsage = 1;
    int32 RamUsage = 2;
    """
    #dummy data for now
    MiBRamUsage = psutil.virtual_memory().used / (2^20)
    CPUUsage = psutil.cpu_percent(interval=1)
    response = stub.SendDynamicMetrics(daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage, MiBRamUsage=MiBRamUsage))

if __name__ == '__main__':
    sendStaticMetrics()
    sendDynamicMetrics()
