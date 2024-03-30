#!/bin/bash

# Start the command node
cd ../
export PYTHONPATH=$(pwd)
cd command
cd ../protos/build
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../command
echo $PYTHONPATH
python test_command.py
