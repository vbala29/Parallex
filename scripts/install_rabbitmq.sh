#!/bin/bash

cd Parallex

chmod +x rmq_install.sh
source rmq_install.sh

sudo systemctl start rabbitmq-server

chmod +x rmq_setup.sh
source rmq_setup.sh
