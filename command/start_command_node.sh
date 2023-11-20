#!/bin/bash

# Start the command node
cd ../
export PYTHONPATH=$(pwd)
cd command
cd ../protos/provider_command_protos
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
cd ../protos/user_command_protos
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
echo $PYTHONPATH
source ../test-env/env/bin/activate
python command.py

