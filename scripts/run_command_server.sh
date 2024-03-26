#!/bin/bash
(
source anaconda3/etc/profile.d/conda.sh
conda activate parallex
cd Parallex/command
git pull origin
sudo systemctl restart rabbitmq-server
nohup ./start_command_node.sh > command_node.log 2> command_node.err &
)
