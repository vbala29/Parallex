#!/bin/bash

# Start the daemon on provider node
cd ../ 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd provider
cd ../protos/provider_command_protos 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../provider
python daemon.py