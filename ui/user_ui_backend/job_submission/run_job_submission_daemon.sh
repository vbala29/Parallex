#!/bin/bash

# Start the job_submission_daemon
cd ../../../ 
export PYTHONPATH=$PYTHONPATH:$(pwd)
cd ui/user_ui_backend/job_submission
python job_submission_daemon.py