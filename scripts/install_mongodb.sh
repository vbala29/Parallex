#!/bin/bash

# This yum configuration file was scped from the scripts folder in setup_cluster.py
sudo mv amzn23-mongo.yum /etc/yum.repos.d/mongodb-org-7.0.repo
sudo yum install -y mongodb-org
sudo systemctl daemon-reload
sudo systemctl start mongod
sudo systemctl enable mongod # Enable mongo to start after system reboot
