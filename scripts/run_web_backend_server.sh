#!/bin/bash
(
cd Parallex/ui/user_ui_backend
git pull origin
nohup SECRET_KEY="6t18r7q2y9fewuhjo" node index.js > backend.log 2> backend.err &
)
