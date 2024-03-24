#!/bin/bash

for proc in $(lsof -t -c node); do kill -9 $proc; done
