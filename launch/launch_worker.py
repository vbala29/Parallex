import subprocess
import launch_utils
import launch_head

# TODO(andyliu14): Replace this during command node integration.
_HEAD_ADDRESS_PORT: str = "192.168.1.50:6000"

if __name__ == "__main__":
    launch_utils.make_dir(launch_head._TEMP_DIR)
    subprocess.run(f"ray start --address={_HEAD_ADDRESS_PORT}")
