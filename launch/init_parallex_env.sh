#!/bin/bash

# Define the environment name
ENV_NAME="parallex_env"

# Check if Conda is installed
if ! command -v conda &> /dev/null; then
    echo "Conda not found. Installing Miniconda..."
    
    # Download Miniconda installation script
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O miniconda_installer.sh

    # Install Miniconda
    bash miniconda_installer.sh -b -p $HOME/miniconda
    rm miniconda_installer.sh

    # Add Miniconda to PATH
    export PATH="$HOME/miniconda/bin:$PATH"

    echo "Miniconda installed."

    ~/miniconda/bin/conda init bash
fi
# Restart shell
exec bash
# Create the Conda environment in parallex_runtime.yaml
conda env create -f parallex_runtime.yml

conda init
# Activate the Conda environment
conda activate $ENV_NAME
python -c "import ray; print(f'{ray.__version__} successfully imported.')"

echo "Parallex environment setup completed."
