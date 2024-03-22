#!/bin/bash

if ! test -f Anaconda3-2020.02-Linux-x86_64.sh; then
  sudo yum update
  sudo yum install libXcomposite libXcursor libXi libXtst libXrandr alsa-lib mesa-libEGL libXdamage mesa-libGL libXScrnSaver

  sudo curl -O https://repo.anaconda.com/archive/Anaconda3-2020.02-Linux-x86_64.sh
  bash Anaconda3-2020.02-Linux-x86_64.sh

  source ~/.bashrc
  source anaconda3/etc/profile.d/conda.sh
  conda init bash
fi
