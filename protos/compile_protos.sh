(
    OUTPUT_FOLDER=./build/
    mkdir -p $OUTPUT_FOLDER
    python -m grpc_tools.protoc -I. --python_out=$OUTPUT_FOLDER --grpc_python_out=$OUTPUT_FOLDER ./daemon.proto
    python -m grpc_tools.protoc -I. --python_out=$OUTPUT_FOLDER --grpc_python_out=$OUTPUT_FOLDER ./user.proto
)
