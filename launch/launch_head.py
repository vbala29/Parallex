import subprocess
import socket
import launch_utils

_TEMP_DIR: str = "C:\\ParallexTempDir"

if __name__ == "__main__":
    hostname = socket.gethostname()
    ip_address = socket.gethostbyname(hostname)
    open_port = launch_utils.find_open_port(hostname)

    if open_port is None:
        raise ValueError(f"Could not find an open port.")

    launch_utils.make_dir(_TEMP_DIR)
    subprocess.run(
        f"ray start --head --port={open_port} --temp-dir={_TEMP_DIR}".split()
    )
