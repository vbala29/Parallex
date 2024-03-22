#!/bin/bash

cd Parallex/command
conda env create -f environment_xcompat.yml
conda activate parallex
./start_command_node.sh
