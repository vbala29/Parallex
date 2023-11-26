#!/bin/bash

# Start the daemon on provider node
cd ../ 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd provider
cd ../protos/build
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ../../provider
python daemon.py