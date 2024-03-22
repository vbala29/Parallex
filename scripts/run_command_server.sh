#!/bin/bash
(
source anaconda3/etc/profile.d/conda.sh
conda activate parallex
cd Parallex/command
git pull origin
./start_command_node.sh &
)
