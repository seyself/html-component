#!/bin/bash

DIR=$(cd $(dirname $0); pwd)
cd $DIR

# coffee -o ./dist/ --join generator.js -bw ./src/*.coffee
babel lib-src/generator --watch --out-dir lib/generator
