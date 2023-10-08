import grpc
import daemon_pb2_grpc
import daemon_pb2

def sendStaticMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsDaemonStub(channel)
    """
    int32 CPUNumCores = 1;
    string CPUName = 2;
    int32 MBMemory = 3;
    int32 MBRam = 4;
    """
    #dummy data for now
    CPUNumCores = 4
    CPUName = "Intel"
    MBMemory = 16
    MBRam = 16
    response = stub.SendMetrics(daemon_pb2.StaticMetrics(CPUNumCores=CPUNumCores, CPUName=CPUName, MBMemory=MBMemory, MBRam=MBRam))
    print(response)

def sendDynamicMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsDaemonStub(channel)
    """
    int32 CPUUsage = 1;
    int32 MemoryUsage = 2;
    int32 RamUsage = 3;
    """
    #dummy data for now
    CPUUsage = 20
    MemoryUsage = 40
    RamUsage = 60
    response = stub.SendMetrics(daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage, MemoryUsage=MemoryUsage, RamUsage=RamUsage))
    print(response)

if __name__ == '__main__':
    sendStaticMetrics()
    sendDynamicMetrics()
