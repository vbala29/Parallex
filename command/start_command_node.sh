#!/bin/bash

# Start the command node
cd ../
export PYTHONPATH=$(pwd)
cd command
cd ../protos/provider_command_protos
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
cd ../protos/build
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
echo $PYTHONPATH
python command_node.py
