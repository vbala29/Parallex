#!/bin/bash

# Install node on debian
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs

(
# Clone repoistory and build protos
git clone https://github.com/vbala29/Parallex.git

mkdir Parallex/access_tokens
cd Parallex

# Install conda enviornment
source ../anaconda3/etc/profile.d/conda.sh
conda env create -f environment_xcompat.yml
conda activate parallex

chmod +x build.sh
./build.sh

# Insall node modules
cd ui/user_ui/
npm install
cd ../user_ui_backend
npm install
)
