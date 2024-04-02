#!/bin/bash

# Get a list of all queue names
queues=$(sudo rabbitmqctl list_queues name | awk 'NR > 1')

# Loop over each queue and purge it
for queue in $queues
do
  sudo rabbitmqctl purge_queue $queue
done