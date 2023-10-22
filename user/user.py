import grpc
import user_pb2_grpc
import user_pb2

def sendJob():
    channel = grpc.insecure_channel('localhost:50051')
    stub = user_pb2_grpc.UserStub(channel)
    """
    float lat = 1;
    float lon = 2;
    """
    response = stub.SendJob(user_pb2.Job(lat=100, lon=100))
    print("Job sent")

if __name__ == '__main__':
    sendJob()