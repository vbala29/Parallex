#!/bin/bash

# Start the daemon on provider node
cd ../ 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd provider
cd ../protos/provider_command_protos 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../provider
source ../test-env/env/bin/activate
python daemon.py