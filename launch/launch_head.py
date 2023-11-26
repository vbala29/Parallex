""" Launches a Parallex cluster head node. """
import subprocess


def launch_head(port: int):
    """Launches a Parallex cluster's head node.

    Args:
        port (int): The description on which to start the port

    Raises:
        CalledProcessError: If cluster fails to launch
    """

    subprocess.run(f"ray start --head --port={port}".split(), check=True)
