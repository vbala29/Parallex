#!/bin/bash

# Define the environment name
ENV_NAME="parallex_runtime"

# Check if Conda is installed
if ! command -v conda &> /dev/null; then
    echo "Conda not found. Installing Miniconda..."
    # Install Miniconda

    mkdir -p ~/miniconda3
    wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh -O ~/miniconda3/miniconda.sh
    bash ~/miniconda3/miniconda.sh -b -u -p ~/miniconda3
    rm -rf ~/miniconda3/miniconda.sh
        
    echo "Miniconda installed."

    ~/miniconda3/bin/conda init bash
    source ~/.bashrc

    # Add Miniconda to PATH
    export PATH="$HOME/miniconda3/bin:$PATH"
fi

# # Restart shell
# exec bash

# Create the Conda environment in parallex_runtime.yaml
conda env create --file ~/parallex_runtime.yml

conda init

# Activate the Conda environment
conda activate $ENV_NAME
python -c "import ray; print(f'{ray.__version__} successfully imported.')"

echo "Parallex environment setup completed."
