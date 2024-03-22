#!/bin/bash

if ! test -f Anaconda3-2020.02-Linux-x86_64.sh; then
  sudo apt-get update
  sudo apt-get install libgl1-mesa-glx libegl1-mesa libxrandr2 libxrandr2 libxss1 libxcursor1 libxcomposite1 libasound2 libxi6 libxtst6
  sudo curl -O https://repo.anaconda.com/archive/Anaconda3-2020.02-Linux-x86_64.sh
  bash Anaconda3-2020.02-Linux-x86_64.sh
  source ~/.bashrc
  source anaconda3/etc/profile.d/conda.sh
  conda init bash
fi
