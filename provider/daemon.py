import psutil
from cpuinfo import get_cpu_info

import grpc
import daemon_pb2_grpc
import daemon_pb2
import time

DYNAMIC_METRIC_INTERVAL_SEC = 2
BYTES_IN_MEBIBYTE = 2 ^ 20
CPU_FREQ_INTERVAL_SEC = 1


def sendStaticMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    int32 CPUNumCores = 1;
    string CPUName = 2;
    float MiBRam = 3; 
    """
    #dummy data for now
    CPUNumCores = psutil.cpu_count(logical=True)
    cpu_info = get_cpu_info()
    CPUName = cpu_info['brand_raw'] + " " + cpu_info['arch']
    MiBRam = psutil.virtual_memory().total / (BYTES_IN_MEBIBYTE)
    response = stub.SendStaticMetrics(
        daemon_pb2.StaticMetrics(CPUNumCores=CPUNumCores,
                                 CPUName=CPUName,
                                 MiBRam=MiBRam))


def sendDynamicMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    float CPUUsage = 1;
    float MiBRamUsage = 2;
    """
    #dummy data for now
    MiBRamUsage = psutil.virtual_memory().used / (BYTES_IN_MEBIBYTE)
    CPUUsage = psutil.cpu_percent(interval=CPU_FREQ_INTERVAL_SEC)
    response = stub.SendDynamicMetrics(
        daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage, MiBRamUsage=MiBRamUsage))


def startDaemon():
    sendStaticMetrics()
    while True:
        time.sleep(DYNAMIC_METRIC_INTERVAL_SEC)
        sendDynamicMetrics()


if __name__ == '__main__':
    startDaemon()
