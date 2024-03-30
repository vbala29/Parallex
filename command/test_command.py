import grpc
from protos.build import user_pb2
from protos.build import user_pb2_grpc


def _free_provider(stub, provider):
    print(f"Freeing provider: {provider}")
    response = stub.FreeNode(provider)
    print(response)


def run():
    # Step 1: Create a channel to the server
    channel = grpc.insecure_channel("127.0.0.1:50051")

    # Step 2: Create a stub (client)
    stub = user_pb2_grpc.JobStub(channel)

    # Step 3: Create a UserMetrics message
    job_metrics = user_pb2.JobMetrics(
        clientIP="127.0.0.1", jobID="abc", jobUserID="abc", cpuCount=2, memoryCount=1024
    )

    # Step 4: Call the SendUser method
    response = stub.SendJob(job_metrics)

    # Step 5: Print the response
    print(response)

    _free_provider(stub, response.headProvider)
    for provider in response.providers:
        _free_provider(stub, provider)


if __name__ == "__main__":
    run()
