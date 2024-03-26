#!/bin/bash

for proc in $(lsof -t -c node); do kill -9 $proc; done
for proc in $(lsof -t -c python); do kill -9 $proc; done