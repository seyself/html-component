#!/bin/bash

DIR=$(cd $(dirname $0); pwd)
cd $DIR

coffee -o ../ --join generator.js -bw ../src/*.coffee
