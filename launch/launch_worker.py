""" Launches a Parallex cluster worker node. """

import subprocess


def launch_worker(head_ip: str, port: int):
    """Launches a Parallex cluster's worker node.

    Args:
        head_ip (str): The IP address of the head node. Must be publically accessible.
        port (int): The description on which to start the port

    Raises:
        CalledProcessError: If cluster fails to launch
    """
    conda_activate_command = "conda activate parallex_runtime"
    start_command = f"ray start --address={head_ip}:{port}"
    subprocess.run(f"{conda_activate_command}; {start_command}", shell=True, check=True)
