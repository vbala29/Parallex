from ray.job_submission import JobSubmissionClient, JobStatus
import time

# If using a remote cluster, replace 127.0.0.1 with the head node's IP address. 
client = JobSubmissionClient("http://127.0.0.1:8265")
job_id = client.submit_job(
    # Entrypoint shell command to execute
    entrypoint="python job_script.py",
    # Path to the local directory that contains the script.py file, parallex env name
    runtime_env={"working_dir": "./working_dir/", "conda": "parallex_env"},
)
print(job_id)

def wait_until_status(job_id, status_to_wait_for, timeout_seconds=5):
    start = time.time()
    while time.time() - start <= timeout_seconds:
        status = client.get_job_status(job_id)
        print(f"status: {status}")
        if status in status_to_wait_for:
            break
        time.sleep(1)


wait_until_status(job_id, {JobStatus.SUCCEEDED, JobStatus.STOPPED, JobStatus.FAILED})
logs = client.get_job_logs(job_id)
print(logs)