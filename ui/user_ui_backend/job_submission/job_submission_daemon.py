import time
import asyncio
import json
from threading import Thread
from ray.job_submission import JobSubmissionClient, JobStatus

from aqmp_tools.AQMPConsumerConnection import AQMPConsumerConnection
from aqmp_tools.formats.job_submission_request import job_submission_request


QUEUE_NAME : str = "ray_job_startup"
_HEAD_START_DELAY_SECS : int = 5
_EXPRESS_SERVER_IP : str = "127.0.0.1"

def wait_until_status(client, job_id, status_to_wait_for, timeout_seconds=5):
    start = time.time()
    while time.time() - start <= timeout_seconds:
        status = client.get_job_status(job_id)
        print(f"status: {status}")
        if status in status_to_wait_for:
            break
        time.sleep(1)

async def handleJobSubmissionRequest(msg):
    async with msg.process():
        req = job_submission_request.initFromDict(json.loads(msg.body))
        job_name = req.get_job_name()
        head_node_url = req.get_head_node_url()
        print(f"Received job startup request. Params: job_name = {job_name}, head_node_url = {head_node_url}")
        print(f' Sleeping for {_HEAD_START_DELAY_SECS}')
        time.sleep(_HEAD_START_DELAY_SECS)


        client = JobSubmissionClient(head_node_url)
        job_id = client.submit_job(
            # Entrypoint shell command to execute
            entrypoint="python job_script.py",
            # Path to the local directory that contains the script.py file, parallex env name
            runtime_env={"working_dir": f"../extracted/{job_name}/working_dir", "conda": "parallex_runtime"},
        )
        print(f"Job ID = {job_id}")

        wait_until_status(client, job_id, {JobStatus.SUCCEEDED, JobStatus.STOPPED, JobStatus.FAILED})   
        logs = client.get_job_logs(job_id)
        print(logs)
        
def start_background_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()

if __name__ == "__main__":
    aqmp = AQMPConsumerConnection(_EXPRESS_SERVER_IP)
    aqmp.loop.run_until_complete(aqmp.setupAQMP())
    aqmp.loop.run_until_complete(aqmp.initializeQueue(QUEUE_NAME))
    t = Thread(target=start_background_loop, args=(aqmp.loop,), daemon=True)
    t.start()

    asyncio.run_coroutine_threadsafe(
        aqmp.receive_messages(QUEUE_NAME, lambda msg: handleJobSubmissionRequest(msg)),
        aqmp.loop,
    )

    while True:
        pass