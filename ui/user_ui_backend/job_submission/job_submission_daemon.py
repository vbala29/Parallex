import time
import asyncio
import json
import os
from threading import Thread
import requests
import subprocess
from pathlib import Path
import zipfile
from ray.job_submission import JobSubmissionClient, JobStatus

from aqmp_tools.AQMPConsumerConnection import AQMPConsumerConnection
from aqmp_tools.formats.job_submission_request import job_submission_request

from launch import launch_utils

base_path = Path(__file__).parent
file_path = (base_path / "../../../config/config.json").resolve()
config = json.load(open(file_path))

_QUEUE_NAME: str = config["rabbitmq"]["job_submission_queue_name"]
_HEAD_START_DELAY_SECS: int = 20
_RABBIT_MQ_IP: str = config["ip_addresses"]["rabbitmq_broker"]
_BACKEND_IP: str = (
    f'http://{config["ip_addresses"]["web_backend_server"]}:{str(config["ports"]["web_backend_server"])}'
)




def wait_until_status(client, job_id, status_to_wait_for, timeout_seconds=5):
    start = time.time()
    while time.time() - start <= timeout_seconds:
        status = client.get_job_status(job_id)
        print(f"status: {status}")
        if status in status_to_wait_for:
            break
        time.sleep(1)


def submit_ray_job(
    working_dir: str, head_node_ip: str, runtime_name: str, job_script_name: str
):
    runtime_env_json = '{"conda": "parallex_runtime"}'
    submit_job_command = f"RAY_ADDRESS='{head_node_ip}' ray job submit --working-dir {working_dir} -- python {job_script_name}"
    print(submit_job_command)
    wrapped_command = launch_utils.make_conda_command(submit_job_command)
    print(wrapped_command)
    subprocess.run(
        wrapped_command,
        shell=True,
        check=True,
    )

def get_and_extract_files(job_name, working_dir):
    api_endpoint = _BACKEND_IP + '/job-files'
    try: 
        response = requests.get(url=api_endpoint, params={"job_name": job_name})
        if not os.path.exists(f'../extracted/{job_name}'):
            os.makedirs(f'../extracted/{job_name}')
        
        if not os.path.exists(f'../extracted/{job_name}'):
            os.makedirs(working_dir)
        
        zip_save_path = f'../extracted/{job_name}/{job_name}.zip'
        
        if response.status_code == 200:
            with open(zip_save_path, 'wb') as file:
                file.write(response.content)
        else:
            print(f"Failed to download zip: Status Code: {response.status_code}")

        with zipfile.ZipFile(zip_save_path,"r") as zip_ref:
            zip_ref.extractall(working_dir)

    except Exception as e:
        print("An error occurred:", e)
    





async def handleJobSubmissionRequest(msg):
    async with msg.process():
        req = job_submission_request.initFromDict(json.loads(msg.body))
        job_name = req.get_job_name()
        head_node_url = req.get_head_node_url()
        print(
            f"Received job startup request. Params: job_name = {job_name}, head_node_url = {head_node_url}"
        )

        working_dir = f"../extracted/{job_name}/working_dir"

        get_and_extract_files(job_name = job_name, working_dir= working_dir)


        print(f" Sleeping for {_HEAD_START_DELAY_SECS}")
        time.sleep(_HEAD_START_DELAY_SECS)

        

        
        conda_name = "parallex_runtime"
        head_node_ip = head_node_url
        job_script_name = "job_script.py"
        submit_ray_job(working_dir, head_node_ip, conda_name, job_script_name)
        print("Successfully started ray job")

        # client = JobSubmissionClient(head_node_url)
        # job_id = client.submit_job(
        #     # Entrypoint shell command to execute
        #     entrypoint="python job_script.py",
        #     # Path to the local directory that contains the script.py file, parallex env name
        #     runtime_env={
        #         "working_dir": f"../extracted/{job_name}/working_dir",
        #         "conda": "parallex_runtime",
        #     },
        # )
        # print(f"Job ID = {job_id}")

        # wait_until_status(
        #     client, job_id, {JobStatus.SUCCEEDED, JobStatus.STOPPED, JobStatus.FAILED}
        # )
        # logs = client.get_job_logs(job_id)
        # print(logs)


def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()


if __name__ == "__main__":
    aqmp = AQMPConsumerConnection(_RABBIT_MQ_IP)
    aqmp.loop.run_until_complete(aqmp.setupAQMP())
    aqmp.loop.run_until_complete(aqmp.initializeQueue(_QUEUE_NAME))
    t = Thread(target=start_background_loop, args=(aqmp.loop,), daemon=True)
    t.start()

    asyncio.run_coroutine_threadsafe(
        aqmp.receive_messages(_QUEUE_NAME, lambda msg: handleJobSubmissionRequest(msg)),
        aqmp.loop,
    )

    while True:
        pass
