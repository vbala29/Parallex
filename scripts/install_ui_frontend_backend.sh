#!/bin/bash

# Install node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
nvm install --lts

# Clone repoistory and build protos
git clone https://github.com/vbala29/Parallex.git

mkdir Parallex/access_tokens
cd Parallex

# Install conda enviornment
conda env create -f environment_xcompat.yml
conda activate parallex

chmod +x build.sh
./build.sh

# Insall node modules
cd ui/user_ui/
npm install
cd ../user_ui_backend
npm install
