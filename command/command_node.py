from typing import Optional
import ipinfo
import grpc
import geopy.distance
from collections import defaultdict
from concurrent import futures
import asyncio
from threading import Thread
import urllib
from pathlib import Path
import json

from command.provider import Provider, ProviderCandidate
from protos.build import daemon_pb2
from protos.build import daemon_pb2_grpc
from protos.build import user_pb2
from protos.build import user_pb2_grpc
from aqmp_tools.formats.join_cluster_request import join_cluster_request
from aqmp_tools.AQMPProducerConnection import AQMPProducerConnection

import time
import threading


HEAD_NODE_CPUS = 1
HEAD_NODE_RAM = 2048
_GC_FIDELITY_SECS = 60

base_path = Path(__file__).parent
file_path = (base_path / "../config/config.json").resolve()
config = json.load(open(file_path))
_RABBITMQ_BROKER = config["ip_addresses"]["rabbitmq_broker"]


class Job:
    def __init__(self, ip):
        self.ip = ip

    def parse_location(self, location):
        split = location.split(",")
        self.lat = split[0]
        self.lon = split[1]


class Poller(threading.Thread):
    def __init__(self, interval, function_manager):
        super().__init__()
        self.interval = interval
        self.fm = function_manager

    def run(self):
        while not self.fm.stop_event_set():
            self.fm.run()
            time.sleep(self.interval)


class GarbageCollectorRunner:
    """Runs the garbage collector for inactive nodes on the command node."""

    def __init__(self, cm):
        self.cm = cm
        self.stop_event = threading.Event()

    def run(self):
        # Only need to scan through providers and active providers because all heads are in providers and all active heads are in active providers.

        expired_providers = []
        for provider_id, provider in self.cm.providers.items():
            if provider.is_expired():
                expired_providers.append(provider_id)
        for provider_id, provider in self.cm.active_providers.items():
            if provider.is_expired():
                expired_providers.append(provider_id)
        for provider_id in expired_providers:
            self._expire_provider(provider_id)

    def stop_event_set(self) -> bool:
        """Returns if the stop event is set."""
        return False

    def _expire_provider(self, provider_id: str):
        """Deletes nodes and removes it from provider lists"""
        if provider_id in self.cm.active_providers:
            print(f"Expiring an active provider: {provider_id}")
            del self.cm.active_providers[provider_id]

        if provider_id in self.cm.active_heads:
            print(f"Expiring an active head node: {provider_id}")
            del self.cm.active_heads[provider_id]

        if provider_id in self.cm.providers:
            print(f"Expiring an available provider: {provider_id}")
            del self.cm.providers[provider_id]

        if provider_id in self.cm.head_nodes:
            print(f"Expiring an eligible head node: {provider_id}")
            del self.cm.head_nodes[provider_id]


class CommandNode:
    """Handles cluster creation and provider selection."""

    def __init__(self, aqmp):
        """Initializes the command node.

        Args:
            aqmp (AQMPProducerConnection):  RabbitMQ Producer Handler
        """
        self.aqmp = aqmp

        # Dict of provider UUIDs to provider objects
        self.providers = defaultdict(dict)
        self.active_providers = defaultdict(dict)

        # Head nodes include all available head node candidates. These can be dupliated in `self.providers`
        # because any head node can act as a provider, but not every provider can act as a head node.
        # The same follows for `active_heads`. Any entry in `active_head` will also be in `active_providers`,
        # but not the converse.
        self.head_nodes = defaultdict(dict)
        self.active_heads = defaultdict(dict)

    def add_provider(self, provider: Provider) -> None:
        """Registers a provider with the command node."""
        if provider.uuid in self.active_providers:
            print(f"Re-registering active provider - resetting state: {provider.uuid}")
            self.release_active_node(provider.uuid)
            return

        if provider.uuid in self.providers:
            print(f"Provider already exists: {provider.uuid}")
            return

        self.providers[provider.uuid] = provider
        if provider.is_head_eligible():
            self.head_nodes[provider.uuid] = provider
        asyncio.run_coroutine_threadsafe(
            self.aqmp.initializeQueue(provider.uuid), self.aqmp.loop
        )

    def get_provider(self, uuid: str) -> Optional[Provider]:
        """Returns a provider given a UUID"""
        if uuid in self.providers:
            return self.providers[uuid]
        if uuid in self.active_providers:
            return self.active_providers[uuid]
        return None

    def activate_job_cluster(
        self, required_cpu: int, required_memory: int
    ) -> tuple[Provider, list[Provider]]:
        """Selects a head node and providers for a job cluster. Returns a tuple of head node and providers."""
        print(
            f"Activating a job cluster with CPU: {required_cpu} and memory: {required_memory}"
        )
        head = self._select_and_reserve_head()
        if head is None:
            print(
                f"Failed to find a head node for job with CPU: {required_cpu} and memory: {required_memory}"
            )
            return None, None
        print(f"Selected head node with uuid: {head.uuid}")
        # Select providers out of available providers in `self.providers`

        # Technically `required_cpu` and `required_memory` should be updated to subtract out the head's resources.
        # TODO(andy)
        providers = self._select_providers(
            self.providers, (head.lat, head.lon), required_cpu, required_memory
        )

        if providers:
            for provider in providers:
                self._activate_provider(provider, is_head=False)
        return head, providers

    def release_active_node(self, uuid: str) -> None:
        """Resets an active node and adds it into available providers lists"""
        if uuid not in self.active_providers:
            print(f"Trying to release inactive node: {uuid}")
            if uuid not in self.providers:
                raise ValueError(f"Node not found: {uuid}")
            return
        provider = self.active_providers[uuid]
        del self.active_providers[uuid]
        if uuid in self.active_heads:
            del self.active_heads[uuid]

        # Add back to list of available providers
        self.providers[uuid] = provider

        if provider.is_head_eligible():
            self.head_nodes[uuid] = provider

    def _activate_provider(self, provider: Provider, is_head: bool) -> None:
        """Activates a provider and removes it from the available providers list."""
        print(f"Activating provider: {provider.uuid}")
        if provider.uuid not in self.providers:
            raise ValueError(f"Provider not found: {provider.uuid}")

        if provider.uuid in self.active_providers:
            raise ValueError(f"Provider already active: {provider.uuid}")

        print(
            f"Removing provider: {provider.uuid} from providers and adding it to active providers"
        )
        self.active_providers[provider.uuid] = provider
        del self.providers[provider.uuid]

        # If the provider was an eligible head node, remove it.
        if provider.uuid in self.head_nodes:
            print(f"Removing provider: {provider.uuid} from eligible head nodes")
            del self.head_nodes[provider.uuid]

        # If the provider will be used as a head node, add it as a head.
        if is_head:
            print(f"Setting provider: {provider.uuid} as an active head")
            self.active_heads[provider.uuid] = provider

    def _select_and_reserve_head(self) -> Optional[Provider]:
        """Picks a head node and sets it as active. Returns `None` if no head nodes are available."""
        if not self.head_nodes:
            print("No eligible head nodes found")
            return None

        first_head_uuid = list(self.head_nodes.keys())[0]

        head = self.head_nodes[first_head_uuid]

        self._activate_provider(head, is_head=True)
        return head

    def _select_providers(
        self,
        provider_dict,
        user_location,
        required_cpu,
        required_memory,
    ) -> Optional[list[Provider]]:
        """Selects a provider from `provider_dict`. Greedily selects until `required_cpu` and `required_memory` are met.

        Args:
            provider_dict (dict): A dictionary of provider UUIDs to provider objects
            num_requested (int): The number of providers to select
            user_location (tuple): A tuple of the user's location (lat, lon)
            required_cpu (int): The number of CPUs required in total
            required_memory (int): The amount of memory required, in MiB in total

        Returns:
            A list of selected providers. Returns None if no providers could be found.

        """

        if not provider_dict:
            print("Returning early because provider dict is empty")
            return []  # DO NOT RETURN NONE

        provider_candidates = []

        for _, provider in provider_dict.items():
            print(provider)
            distance = geopy.distance.distance(
                (provider.lat, provider.lon), user_location
            ).km

            provider_mib_ram = provider.static_metrics["MiBRam"]
            provider_cpu_num_cores = provider.static_metrics["CPUNumCores"]

            provider_candidates.append(
                ProviderCandidate(
                    provider, distance, provider_mib_ram, provider_cpu_num_cores
                )
            )

        provider_candidates.sort()  # Sort by CPU, then RAM, then distance
        print("Sorted provider candidates")
        selected_providers = []
        total_cpu = 0
        total_memory = 0

        # Greedily select providers until CPU and memory requirements are met
        while total_cpu < required_cpu and total_memory < required_memory:
            if not provider_candidates:
                break
            candidate = provider_candidates.pop()
            selected_providers.append(candidate.provider)
            total_cpu += candidate.cpuCountAvailable
            total_memory += candidate.ramCountAvailable

        return selected_providers


def set_location(p):
    """Sets the location of `p`. Required `p` have `parse_location` method."""
    access_token = None
    with open("../access_tokens/ipinfo", "r", encoding="utf-8") as f:
        access_token = f.read().strip()
    if not access_token:
        raise RuntimeError("Failed to get access token")
    handler = ipinfo.getHandler(access_token)
    # ip_address = p.ip
    # For sake of local testing use local IP
    ip_address = urllib.request.urlopen("http://ident.me").read().decode("utf8")
    details = handler.getDetails(ip_address)
    p.parse_location(details.loc)


class DaemonHandler(daemon_pb2_grpc.MetricsServicer):
    """Handles metric releated commands"""

    def __init__(self, command_module: CommandNode):
        self.cm = command_module

    def SendStaticMetrics(self, request, context):
        ip = request.clientIP
        uuid = request.uuid
        p = Provider(ip=ip, uuid=uuid)
        p.update_static_metrics(
            {
                "CPUNumCores": request.CPUNumCores,
                "CPUName": request.CPUName,
                "MiBRam": request.MiBRam,
            }
        )

        # Update the location of the provider
        set_location(p)

        # TODO(andy) Add feedback into backend to validate this uuid.
        self.cm.add_provider(p)  # Handles duplicates implicitly

        print(
            f"Registered provider with UUID {request.uuid} and IP {request.clientIP} with static metrics."
        )

        return daemon_pb2.Empty()

    def SendDynamicMetrics(self, request, context):
        provider = self.cm.get_provider(request.uuid)
        if provider is None:
            print(f"Provider not found on dynamic metrics: {request.uuid}")
            return daemon_pb2.Empty()
        provider.update_dynamic_metrics(
            {
                "CPUUsage": request.CPUUsage,
                "MiBRamUsage": request.MiBRamUsage,
            }
        )
        print(f"Updated dynamic metrics for provider: {provider.uuid}")

        return daemon_pb2.Empty()


def _build_provider_map(head: Provider, providers: list[Provider]) -> dict[str, str]:
    provider_map = {provider.ip: provider.uuid for provider in providers}
    provider_map[head.ip] = head.uuid
    return provider_map


class JobHandler(user_pb2_grpc.JobServicer):
    """Handles Job related commands"""

    def __init__(self, aqmp, command_module: CommandNode):
        self.aqmp = aqmp
        self.cm: CommandNode = command_module

    def SendJob(self, request, context):
        print(f"Received request: {request}")
        job_id = request.jobID
        job_userid = request.jobUserID
        required_cpus = request.cpuCount
        required_memory = request.memoryCount
        print(f"Defining cluster for job: {job_id} and job_userid: {job_userid}")

        head, providers = self.cm.activate_job_cluster(required_cpus, required_memory)

        if not head:
            print("No head nodes available")

            dummy_provider = user_pb2.Provider(
                providerIP="INVALID_IP", providerID="INVALID_ID"
            )
            return user_pb2.JobSpec(headProvider=dummy_provider)

        job = Job(head.ip)
        set_location(job)

        if not providers:
            print(f"Selected no providers for job: {job_id}")
        else:
            print(f"Selected {len(providers)} providers for job: {job_id}")

        # Send request right away to give head node time to initialize cluster
        print(f"Sending cluster head join request to provider: {head.uuid}")
        provider_map = _build_provider_map(head, providers)
        print(f"Freezing job {job_id} provider map as: {provider_map}")

        asyncio.run_coroutine_threadsafe(
            self.aqmp.sendHeadNodeClusterJoinRequest(
                provider_map=provider_map,
                job_id=job_id,
                job_userid=job_userid,
                queueName=head.uuid,
            ),
            self.aqmp.loop,
        )

        for provider in providers:
            print(f"Sending cluster join request to provider: {provider.uuid}")
            req = join_cluster_request.createNewRequest(head.ip)
            _ = asyncio.run_coroutine_threadsafe(
                self.aqmp.sendClusterJoinRequest(provider.uuid, req.dumps()),
                self.aqmp.loop,
            )

        return user_pb2.JobSpec(
            headProvider=head.to_proto(),
            providers=[provider.to_proto() for provider in providers],
        )

    def FreeNode(self, request, context):
        print(f"Received FreeNode request: {request}")
        uuid = request.providerID
        self.cm.release_active_node(uuid)

        return daemon_pb2.Empty()


def serve(aqmp: AQMPProducerConnection, cm: CommandNode):
    port = "50051"
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    daemon_pb2_grpc.add_MetricsServicer_to_server(DaemonHandler(cm), server)
    user_pb2_grpc.add_JobServicer_to_server(JobHandler(aqmp, cm), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started on port " + port)
    server.wait_for_termination()


def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


if __name__ == "__main__":
    aqmp_handler = AQMPProducerConnection(_RABBITMQ_BROKER)
    command_node = CommandNode(aqmp_handler)
    gc = Poller(_GC_FIDELITY_SECS, GarbageCollectorRunner(command_node))
    gc.start()
    aqmp_handler.loop.run_until_complete(aqmp_handler.setupAQMP())
    t = Thread(target=start_background_loop, args=(aqmp_handler.loop,), daemon=True)
    t.start()
    serve(aqmp_handler, command_node)
