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

    subprocess.run(f"ray start --head --port={port} --dashboard-host=0.0.0.0".split(), check=True)
