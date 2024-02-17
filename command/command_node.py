import ipinfo
import grpc
import geopy.distance
from collections import defaultdict
from concurrent import futures
import asyncio
from threading import Thread
import urllib

from command.provider import Provider, ProviderCandidate
from protos.build import daemon_pb2
from protos.build import daemon_pb2_grpc
from protos.build import user_pb2
from protos.build import user_pb2_grpc
from aqmp_tools.formats.join_cluster_request import join_cluster_request
from aqmp_tools.AQMPProducerConnection import AQMPProducerConnection

HEAD_NODE_CPUS = 1
HEAD_NODE_RAM = 2048

_COMMAND_IP = 'localhost'


class Job:
    def __init__(self, ip):
        self.ip = ip

    def parse_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]


class CommandNode:
    def __init__(self):
        # TODO(vikbala): Clean this up and segment by active/inactive in a nicer way
        self.providers = defaultdict(dict)
        self.active_providers = defaultdict(dict)
        self.headNodes = []
        self.active_heads = []

    def add_provider(self, provider, uuid):
        self.providers[provider.ip][uuid] = provider
        self.add_headnode(provider)
        asyncio.run_coroutine_threadsafe(aqmp.initializeQueue(provider.uuid), aqmp.loop)

    def add_headnode(self, provider):
        self.headNodes.append(provider)

    def select_and_reserve_head(self):
        head = None
        for i, provider in enumerate(self.headNodes):
            if (
                provider.static_metrics["CPUNumCores"] >= HEAD_NODE_CPUS
                and provider.static_metrics["MiBRam"] >= HEAD_NODE_RAM
            ):
                head = provider
                self.headNodes.pop(i)
                self.active_heads.append(head)
                break
        if head is None:
            return None

        # Remove from list of available providers
        del self.providers[head.ip][head.uuid]

        # Clean up empty head dict if all UUIDs with the same IP are removed
        if not self.providers[head.ip]:
            del self.providers[head.ip]

        # Save to active providers, so that selection algorithm does not choose the used head node
        self.active_providers[head.ip][head.uuid] = head

        return head

    def select_providers(
        self, user_location, requiredCPU, requiredMemory
    ):  # user location is a tuple (lat, lon)
        best_candidate_providers = []
        for ip in self.providers:
            for uuid in self.providers[ip]:
                provider = self.providers[ip][uuid]
                cpuCountAvailable = provider.static_metrics["CPUNumCores"]
                ramCountAvailable = provider.static_metrics["MiBRam"]
                # use geopy.distance.distance() to calculate distance
                distance = geopy.distance.distance(
                    (provider.lat, provider.lon), user_location
                ).km
                best_candidate_providers.append(
                    ProviderCandidate(
                        provider, distance, ramCountAvailable, cpuCountAvailable
                    )
                )
        best_candidate_providers.sort()
        providers = []
        totalCPU = 0
        totalMemory = 0
        while totalCPU < requiredCPU and totalMemory < requiredMemory:
            if len(best_candidate_providers) == 0:
                break
            p = best_candidate_providers.pop()
            providers.append(p.provider)
            totalCPU += p.cpuCountAvailable
            totalMemory += p.ramCountAvailable

        print(f"providers sorted: {providers}")
        return providers


def findLocation(p):
    f = open("../access_tokens/ipinfo", "r")
    access_token = f.read().strip()
    handler = ipinfo.getHandler(access_token)
    # ip_address = p.ip
    # For sake of local testing use local IP
    ip_address = urllib.request.urlopen("http://ident.me").read().decode("utf8")
    details = handler.getDetails(ip_address)
    p.parse_location(details.loc)


class DaemonHandler(daemon_pb2_grpc.MetricsServicer):
    def __init__(self, cm):
        self.cm = cm

    def SendStaticMetrics(self, request, context):
        ip = request.clientIP
        if (ip not in self.cm.providers) or (request.uuid not in self.cm.providers[ip]):
            print(f"Received static metrics from unknown provider: {request.uuid}")
            p = Provider(ip=ip, uuid=request.uuid)
            self.cm.add_provider(p, request.uuid)
            findLocation(p)

        else:
            print(f"Received static metrics from known provider: {request.uuid}")
            p = self.cm.providers[ip][request.uuid]

        p.update_static_metrics(
            {
                "CPUNumCores": request.CPUNumCores,
                "CPUName": request.CPUName,
                "MiBRam": request.MiBRam,
            }
        )

        return daemon_pb2.Empty()

    def SendDynamicMetrics(self, request, context):
        print("IN HERE")
        ip = request.clientIP
        if ip not in self.cm.providers:
            print(f"Received dynamic metrics from unknown provider: {request.uuid}")
        else:
            print(f"Received dynamic metrics from known provider: {request.uuid}")
            p = self.cm.providers[ip][request.uuid]
            p.update_dynamic_metrics(
                {
                    "CPUUsage": request.CPUUsage,
                    "MiBRamUsage": request.MiBRamUsage,
                }
            )

        return daemon_pb2.Empty()


class JobHandler(user_pb2_grpc.JobServicer):
    def __init__(self, cm):
        self.cm = cm

    def SendJob(self, request, context):
        cpuCount = request.cpuCount
        memoryCount = request.memoryCount
        print("CPUs = " + str(cpuCount))

        headNode = self.cm.select_and_reserve_head()

        print(f"Selected and reserved head: {headNode}")

        if headNode is None:
            print("No head nodes available")
            return user_pb2.HeadNode(headIP="INVALID_IP")

        # Send request right away to give head node time to initialize cluster
        print(f"Sending cluster head join request to provider: {headNode.uuid}")
        asyncio.run_coroutine_threadsafe(
            aqmp.sendHeadNodeClusterJoinRequest(headNode.uuid), aqmp.loop
        )

        job = Job(headNode.ip)
        findLocation(job)
        print(f"Received a job from IP: {request.clientIP}")
        providers = cm.select_providers((job.lat, job.lon), cpuCount, memoryCount)
        print(f"{len(providers)} provider(s) selected")
        print(f"providers nodes selected for job: {providers}")

        for provider in providers:
            print(f"Sending cluster join request to provider: {provider.uuid}")
            req = join_cluster_request.createNewRequest(headNode.ip)
            task = asyncio.run_coroutine_threadsafe(
                aqmp.sendClusterJoinRequest(provider.uuid, req.dumps()), aqmp.loop
            )

        return user_pb2.HeadNode(headIP=headNode.ip)


def serve(cm):
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    daemon_pb2_grpc.add_MetricsServicer_to_server(DaemonHandler(cm), server)
    user_pb2_grpc.add_JobServicer_to_server(JobHandler(cm), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started on port " + port)
    server.wait_for_termination()


def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


if __name__ == "__main__":
    cm = CommandNode()
    aqmp = AQMPProducerConnection(_COMMAND_IP)
    aqmp.loop.run_until_complete(aqmp.setupAQMP())
    t = Thread(target=start_background_loop, args=(aqmp.loop,), daemon=True)
    t.start()
    serve(cm)
