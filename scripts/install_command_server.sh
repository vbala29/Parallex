#!/bin/bash

# Clone repository
git clone https://github.com/vbala29/Parallex.git

# Clone ipinfo API access key
mkdir Parallex/access_tokens
mv ipinfo Parallex/access_tokens
cd Parallex

# Instal conda enviornment
conda init bash
conda env create -f environment_xcompat.yml
conda activate parallex

# Build gRPC protos
chmod +x build.sh
./build.sh

cd command
chmod +x start_command_node.sh
