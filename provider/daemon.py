import psutil
import grpc
import daemon_pb2_grpc
import daemon_pb2
import time
import urllib.request
import uuid
from cpuinfo import get_cpu_info

DYNAMIC_METRIC_INTERVAL_SEC = 1
BYTES_IN_MEBIBYTE = 2 ^ 20
CPU_FREQ_INTERVAL_SEC = 1
UUID = ""
IP = ""


def sendStaticMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    int32 CPUNumCores = 1;
    string CPUName = 2;
    float MiBRam = 3; 
    string clientIP = 4;
    string uuid = 5;
    """
    #dummy data for now
    CPUNumCores = psutil.cpu_count(logical=True)
    cpu_info = get_cpu_info()
    CPUName = cpu_info['brand_raw'] + " " + cpu_info['arch']
    MiBRam = psutil.virtual_memory().total / (BYTES_IN_MEBIBYTE)

    response = stub.SendStaticMetrics(
        daemon_pb2.StaticMetrics(CPUNumCores=CPUNumCores,
                                 CPUName=CPUName,
                                 MiBRam=MiBRam,
                                 clientIP=IP,
                                 uuid=UUID))


def sendDynamicMetrics():
    channel = grpc.insecure_channel('localhost:50051')
    stub = daemon_pb2_grpc.MetricsStub(channel)
    """
    float CPUUsage = 1;
    float MiBRamUsage = 2;
    string clientIP = 3;
    string uuid = 4;
    """
    def generateDyanmicMetrics():
        while True:     
            MiBRamUsage = psutil.virtual_memory().used / (BYTES_IN_MEBIBYTE)
            CPUUsage = psutil.cpu_percent(interval=CPU_FREQ_INTERVAL_SEC)
            time.sleep(DYNAMIC_METRIC_INTERVAL_SEC)
            response =  daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage,
                                  MiBRamUsage=MiBRamUsage,
                                  clientIP=IP,
                                  uuid=UUID)
            yield response
        
    responses = stub.SendDynamicMetrics(generateDyanmicMetrics())

    for response in responses:
        print(f"supposed to run a job with head node ip {response.headIP}")

def startDaemon():
    global IP
    IP = urllib.request.urlopen('http://ident.me').read().decode('utf8')
    print("IP is: {}".format(IP))
    print("UUID is: {}".format(UUID))
    sendStaticMetrics()
    sendDynamicMetrics()


def setupUUID():
    global UUID
    UUID = str(uuid.uuid4())


if __name__ == '__main__':
    setupUUID()
    startDaemon()
