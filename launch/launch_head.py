""" Launches a Parallex cluster head node. """
import subprocess


def launch_head(port: int):
    """Launches a Parallex cluster's head node.

    Args:
        port (int): The description on which to start the port

    Raises:
        CalledProcessError: If cluster fails to launch
    """
    print(f"Starting Parallex head on port: {port}")
    head_start_command = f"ray start --head --port={port} --dashboard-host=0.0.0.0"

    conda_activate_command = f"""
    conda run -n parallex_runtime bash -c "{head_start_command}"
    """
    subprocess.run(conda_activate_command, shell=True, check=True, executable='/bin/bash')
