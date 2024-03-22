#!/bin/bash
(
cd Parallex/ui/user_ui
git pull origin
nohup npm start > frontend.log 2> frontend.err &
)
