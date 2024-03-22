#!/bin/bash

conda activate parallex
cd Parallex/command
git pull origin
./start_command_node.sh
