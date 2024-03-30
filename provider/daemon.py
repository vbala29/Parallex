from typing import Optional
import psutil
import grpc
import time
import urllib.request
import os
import uuid
from cpuinfo import get_cpu_info
from threading import Thread
import asyncio
import json
import socket

import requests
import json
import subprocess

from pathlib import Path
from launch import launch_utils

import daemon_pb2_grpc
import daemon_pb2
import user_pb2_grpc
import user_pb2

from aqmp_tools.AQMPConsumerConnection import AQMPConsumerConnection
from aqmp_tools.formats.head_node_join_cluster_request import (
    head_node_join_cluster_request,
)
from aqmp_tools.formats.join_cluster_request import join_cluster_request

from launch import launch_head
from launch import launch_worker

base_path = Path(__file__).parent
file_path = (base_path / "../config/config.json").resolve()
config = json.load(open(file_path))

DYNAMIC_METRIC_INTERVAL_SEC: int = 1
BYTES_IN_MEBIBYTE: int = 2 ^ 20
CPU_FREQ_INTERVAL_SEC: int = 1
UUID: str = ""
IP: str = ""

_BACKEND_FIDELITY: int = 5
_BACKEND_IP: str = (
    f'http://{config["ip_addresses"]["web_backend_server"]}:{str(config["ports"]["web_backend_server"])}'
)

_HEAD_START_DELAY_SECS: int = 5

_PROMETHEUS_IP_PORT: str = (
    config["prometheus"]["ip"] + ":" + str(config["prometheus"]["port"])
)

_COMMAND_IP_PORT: str = (
    f"{config['ip_addresses']['command_server']}:{config['ports']['command_server']}"
)
_RAY_PORT: str = config["ports"]["ray"]
_BROKER_IP: str = config["ip_addresses"]["rabbitmq_broker"]


import threading


class Poller(threading.Thread):
    def __init__(self, interval, function_manager):
        super().__init__()
        self.interval = interval
        self.fm = function_manager

    def run(self):
        while not self.fm.stop_event_set():
            self.fm.run()
            time.sleep(self.interval)


class DynamicMetricsRunner:
    def __init__(self, channel, metric_stub):
        self.channel = channel
        self.metric_stub = metric_stub

    def run(self):
        self._send_dynamic_metrics()

    def _send_dynamic_metrics(self):
        time.sleep(DYNAMIC_METRIC_INTERVAL_SEC)
        ram_usage_mib = psutil.virtual_memory().used / (BYTES_IN_MEBIBYTE)
        cpu_usage = psutil.cpu_percent(interval=CPU_FREQ_INTERVAL_SEC)
        try:
            _ = self.metric_stub.SendDynamicMetrics(
                daemon_pb2.DynamicMetrics(
                    CPUUsage=cpu_usage,
                    MiBRamUsage=ram_usage_mib,
                    clientIP=IP,
                    uuid=UUID,
                )
            )
        except Exception as e:
            print(f"Exception in send_dynamic_metrics: {e}")

    def stop_event_set(self) -> bool:
        return False


def _get_indexes(arr, target):
    """Returns indexes in arr of strings where entry is equal to target string, case insensitive."""
    return [i for i, s in enumerate(arr) if s.lower() == target.lower()]


class ResourceUpdateRunner:
    def __init__(
        self,
        backend_ip: str,
        provider_map: dict[str, str],
        fidelity: int,
        job_id: str,
        job_userid: str,
        job_stub: user_pb2_grpc.JobStub,
    ):
        """
        Args:
            backend_ip (str): The IP address of the backend server
            provider_map (dict[str, str]): A dictionary mapping provider IP addresses to their UUID.
            fidelity (int): Every `fidelity` seconds, the resource usage will be updated
            job_id (str): The UID of the job in backend space.
            job_userid (str): The UID of the user who submitted the job.
        """
        self.last_poll_time = None
        self.fidelity = fidelity
        self.provider_map = provider_map
        self.backend_ip = backend_ip
        self.session = requests.Session()
        self.stop_event = threading.Event()
        self.job_id = job_id
        self.job_userid = job_userid
        self.job_stub = job_stub

    def _to_pcu(self, cpu: float, ram: float, duration: float) -> float:
        """Converts CPU and RAM usage to PCU.
        Args:
            cpu (float): The CPU usage of the provider.
            ram (float): The RAM usage of the provider.
            duration (float): The time interval in seconds the usage occurred.
        Returns:
            The PCU of the provider
        """
        return (cpu + ram) / 1000 * duration

    def run(self):
        """Runs the resource update runner."""
        resource_consumption_by_provider = self.get_resource_usage()
        time_end = self._get_job_end()

        self.send_resources(resource_consumption_by_provider, time_end)
        if time_end is not None:
            # kill ray
            ray_command = "ray stop"
            subprocess.run(
                launch_utils.make_conda_command(ray_command),
                shell=True,
                check=True,
                executable="/bin/bash",
            )

            self._signal_command_job_end()
            self.stop_event.set()

    def _signal_command_job_end(self):
        """Tells the command node to set this node as free, because the job ended and the cluster was killed."""
        self.job_stub.FreeNode(user_pb2.Provider(providerID=UUID, providerIP=IP))
        return None

    def _get_job_end(self) -> Optional[int]:
        """Checks if a job has ended. Returns None if still in process, and the time the job ended if it has (in ms unix time)."""
        ray_command = "ray job list"

        jobs_string = subprocess.check_output(
            launch_utils.make_conda_command(ray_command),
            stderr=subprocess.STDOUT,
            shell=True,
        ).decode("utf8")

        # The jobs_string is sorted in list of start time. There should only be one job for now, so we can just scan for the first `end_time` entry we see.
        end_time_index = jobs_string.find("end_time=")

        if end_time_index == -1:
            return None  # Job not yet submitted

        value_index = end_time_index + len("end_time=")
        end_value_index = jobs_string.find(",", value_index)

        # This returns the string wrapped with a `'` beginning and end, but int() accounts for that already.
        maybe_time_end = jobs_string[value_index:end_value_index]
        if "None" in maybe_time_end:
            return None
        return int(maybe_time_end)

    def _send_resource(
        self, provider_id: str, cpu: float, ram: float, time_end: Optional[float] = None
    ):
        pcu = (
            self._to_pcu(cpu, ram, self.fidelity) + self.fidelity * 0.01
        )  # Add a charge per second
        api_endpoint = self.backend_ip + "/provider/update"
        headers = {"Content-Type": "application/json"}
        data = {
            "provider_id": provider_id,
            "job_id": self.job_id,
            "job_userid": self.job_userid,
            "pcu_increment": pcu,
        }

        print(f"sending resource: {data}")
        if time_end is not None:
            data["time_end"] = time_end

        # TODO(andy): let's make this async. sync for testing for now.
        response = self.session.post(
            api_endpoint, headers=headers, data=json.dumps(data)
        )
        print(f"resource response: {response}")

    def send_resources(
        self,
        resources: dict[str, tuple[float, float]],
        time_end: Optional[float] = None,
    ):
        """Sends resources to the backend.
        Args:
            resources (tuple[float, float]): The CPU and RAM usage of the provider, over `self.fidelity` seconds.
        """
        for provider_id, (cpu, ram) in resources.items():
            self._send_resource(provider_id, cpu, ram, time_end)

    def _get_ray_node_map(self):
        ray_command = "ray list nodes --format=json"

        node_info = json.loads(
            subprocess.check_output(
                launch_utils.make_conda_command(ray_command),
                stderr=subprocess.STDOUT,
                shell=True,
            ).decode("utf8")
        )

        # `provider_map` maps from the IP of the node to the provider UUID.
        # Here we map from the ray node ID to the provider UUID, intermediating via the provider map and ray's knowledge of the node IP.
        return {
            node["node_id"]: self.provider_map[node["node_ip"]] for node in node_info
        }

    def _process_memory_usage_str(self, memory_usage_str: str) -> float:
        """Process the memory usage string in the ray status output.
        Args:
            memory_usage_str (str): The memory usage string.
        Returns:
            float: The memory usage.
        """
        memory_usage = memory_usage_str.split("/")[0]
        if memory_usage.endswith("GiB"):
            return float(memory_usage[:-3])
        if memory_usage.endswith("MiB"):
            return float(memory_usage[:-3]) * 1024
        if memory_usage.endswith("KiB"):
            return float(memory_usage[:-3]) * 1024 * 1024
        if memory_usage.endswith("B"):
            return float(memory_usage[:-1]) * pow(1024, 3)

        raise ValueError(f"Memory usage string {memory_usage} not recognized.")

    def _process_node_entry(
        self, split_resources: list[str], node_index: int
    ) -> tuple[str, str, str]:
        """Process a node entry in the ray status output.
        Args:
            `split_resources` (str): the split output of the ray status command.
            `node_index` (str): the index of the prefix `Node:` indicating the start of the entry.
        Returns:
            tuple[str, str, str]: The ray node ID, CPU used, and memory used.
        """
        ray_node_id = split_resources[node_index + 1]
        cpu_usage_str = split_resources[node_index + 4]
        cpu_usage = float(cpu_usage_str.split("/")[0])
        memory_usage_str = split_resources[node_index + 6]
        memory_usage = self._process_memory_usage_str(memory_usage_str)
        print(
            f"ray node id: {ray_node_id} used {cpu_usage} CPU and {memory_usage} GiB memory"
        )
        return ray_node_id, cpu_usage, memory_usage

    def get_resource_usage(self) -> dict[str, tuple[float, float]]:
        """
        Returns:
            dict[str, tuple[float, float]]: The CPU and RAM usage of the provider, over `self.fidelity` seconds, mapped to each provider UUID.
        """
        ray_command = f"ray status -v"
        resource_usage = subprocess.check_output(
            launch_utils.make_conda_command(ray_command),
            stderr=subprocess.STDOUT,
            shell=True,
        ).decode("utf8")

        ray_node_map = self._get_ray_node_map()

        print(f"ray node map: {ray_node_map}")

        # Parse the output.
        # First identify the entries for each node, uniquely prefixed by Node: followed by a new line
        resources_split = resource_usage.split()
        output = {}
        node_indexes = _get_indexes(resources_split, "Node:")

        for index in node_indexes:
            # Now process the information for each node, pulling the ray node ID, CPU and memory usage
            ray_node_id, cpu_usage, memory_usage = self._process_node_entry(
                resources_split, index
            )

            # We use the ray node map to convert ray node ID into provider UUID
            provider_uuid = ray_node_map[ray_node_id]
            output[provider_uuid] = (cpu_usage, memory_usage)

        return output

    def stop_event_set(self) -> bool:
        return self.stop_event.is_set()


def send_static_metrics(metric_stub):
    """Sends the following information to the command node:
    1. Number of CPU cores
    2. Model of the CPU
    3. Memory total
    """
    CPUNumCores = psutil.cpu_count(logical=True)
    cpu_info = get_cpu_info()
    CPUName = cpu_info["brand_raw"] + " " + cpu_info["arch"]
    MiBRam = psutil.virtual_memory().total / (BYTES_IN_MEBIBYTE)

    _ = metric_stub.SendStaticMetrics(
        daemon_pb2.StaticMetrics(
            CPUNumCores=CPUNumCores,
            CPUName=CPUName,
            MiBRam=MiBRam,
            clientIP=IP,
            uuid=UUID,
        )
    )


async def handle_cluster_join_request(msg, job_stub):
    async with msg.process():
        jsonMsg = json.loads(msg.body)
        typeStr = jsonMsg["type"]

        if typeStr == join_cluster_request.getTypeStr():
            print("Received join_cluster_request")
            print(f" Sleeping for {_HEAD_START_DELAY_SECS}")
            time.sleep(_HEAD_START_DELAY_SECS)
            req = join_cluster_request.loadFromJson(jsonMsg)
            head_ip = req.getHeadIP()
            launch_worker.launch_worker(head_ip, _RAY_PORT)

        elif typeStr == head_node_join_cluster_request.getTypeStr():
            print("Starting node as head")
            req = head_node_join_cluster_request.loadFromJson(jsonMsg)
            launch_head.launch_head(_RAY_PORT)
            print(f"provider map: {req.provider_map()}")

            # Only run resource updater on the head node.
            resource_update_runner = ResourceUpdateRunner(
                _BACKEND_IP,
                req.provider_map(),
                _BACKEND_FIDELITY,
                req.job_id(),
                req.job_userid(),
                job_stub,
            )
            resource_poller = Poller(
                interval=_BACKEND_FIDELITY, function_manager=resource_update_runner
            )
            resource_poller.run()


def start_daemon():
    global IP
    # IP = urllib.request.urlopen('http://ident.me').read().decode('utf8'
    # For sake of local testing get local IP
    # hostname = socket.gethostname()
    # IP = socket.gethostbyname(hostname)
    IP = _get_local_ip()
    print(f"IP is: {IP}")
    print(f"UUID is: {UUID}")
    channel = grpc.insecure_channel(_COMMAND_IP_PORT)
    metric_stub = daemon_pb2_grpc.MetricsStub(channel)
    job_stub = user_pb2_grpc.JobStub(channel)

    # Send static metrics on start-up
    send_static_metrics(metric_stub)
    asyncio.run_coroutine_threadsafe(
        aqmp.receive_messages(
            UUID, lambda msg: handle_cluster_join_request(msg, job_stub)
        ),
        aqmp.loop,
    )

    dynamic_metrics_poller = Poller(
        DYNAMIC_METRIC_INTERVAL_SEC, DynamicMetricsRunner(channel, metric_stub)
    )
    dynamic_metrics_poller.start()


def _get_local_ip() -> str:
    # TODO(andy) - this is hacky so lets change this
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]


def setupUUID():
    global UUID
    UUID = os.environ.get("PARALLEX_PROVIDER_ID")
    if UUID is None:
        UUID = str(uuid.uuid4())


def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


if __name__ == "__main__":
    # TODO(andy): stop using globals for aqmp
    aqmp = AQMPConsumerConnection(_BROKER_IP)
    setupUUID()
    aqmp.loop.run_until_complete(aqmp.setupAQMP())
    aqmp.loop.run_until_complete(aqmp.initializeQueue(UUID))
    t = Thread(target=start_background_loop, args=(aqmp.loop,), daemon=True)
    t.start()
    start_daemon()
