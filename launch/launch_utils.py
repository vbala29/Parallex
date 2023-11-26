""" Utilities for Parallex head launcher. """
import socket
from contextlib import closing
import os
from typing import Optional
import platform


def is_port_open(host: str, port: int) -> bool:
    """Check if `port` is open on `host`."""
    with closing(socket.socket(socket.AF_INET, socket.SOCK_STREAM)) as sock:
        return sock.connect_ex((host, port))


def find_open_port(
    host: str, *, low_port: int = 6000, high_port: int = 8000
) -> Optional[int]:
    """Finds the first open port on `host` between `low_port` and `high_port`."""
    for port in range(low_port, high_port):
        if is_port_open(host, port):
            return port
    return None


def make_dir(dir_path: str) -> None:
    """Constructs `dir_path` if it does not already exist."""
    if not os.path.exists(dir_path):
        os.makedirs(dir_path)
