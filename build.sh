#!/bin/bash

DIR=$(cd $(dirname $0); pwd)
cd $DIR

# coffee -o ./dist/ -j generator.js -bc ./src/*.coffee
babel lib-src/generator --out-dir lib/generator
