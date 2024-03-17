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
    start_command = f"ray start --address={head_ip}:{port}"


    conda_activate_command = f"""
    conda run -n parallex_runtime bash -c "{start_command}"
    """
    subprocess.run(conda_activate_command, shell=True, check=True, executable='/bin/bash')
