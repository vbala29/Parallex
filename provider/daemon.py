import psutil
import grpc
import daemon_pb2_grpc
import daemon_pb2
import time
import urllib.request
import uuid
from cpuinfo import get_cpu_info
from threading import Thread
from aqmp_tools.AQMPConsumerConnection import AQMPConsumerConnection
import asyncio

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
  
    MiBRamUsage = psutil.virtual_memory().used / (BYTES_IN_MEBIBYTE)
    CPUUsage = psutil.cpu_percent(interval=CPU_FREQ_INTERVAL_SEC)
    time.sleep(DYNAMIC_METRIC_INTERVAL_SEC)
    response =  stub.SendDynamicMetrics(daemon_pb2.DynamicMetrics(CPUUsage=CPUUsage,
                            MiBRamUsage=MiBRamUsage,
                            clientIP=IP,
                            uuid=UUID))

def startDaemon():
    global IP
    IP = urllib.request.urlopen('http://ident.me').read().decode('utf8')
    print("IP is: {}".format(IP))
    print("UUID is: {}".format(UUID))
    sendStaticMetrics()
    asyncio.run_coroutine_threadsafe(aqmp.receive_messages(UUID, (lambda msg: print(msg))), aqmp.loop)

    while True:
        sendDynamicMetrics()

def setupUUID():
    global UUID
    UUID = str(uuid.uuid4())

def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

if __name__ == '__main__':
    aqmp = AQMPConsumerConnection()
    setupUUID()
    aqmp.loop.run_until_complete(aqmp.setupAQMP())
    aqmp.loop.run_until_complete(aqmp.initializeQueue(UUID))
    t = Thread(target=start_background_loop, args=(aqmp.loop,), daemon=True)
    t.start()
    startDaemon()
