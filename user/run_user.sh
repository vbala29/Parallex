#!/bin/bash

# Start the daemon on provider node
cd ../ 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd user
cd ../protos/user_command_protos 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../user
python user.py