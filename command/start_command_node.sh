#!/bin/bash

# Start the command node
cd ../
export PYTHONPATH=$(pwd)
cd command
cd ../protos/build
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
echo $PYTHONPATH
python command_node.py &
echo "Started Command Node"
