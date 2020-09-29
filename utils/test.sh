#!/bin/bash

if [[ ! -f package.json ]]; then
    echo "no packag.json in $PWD"
    exit 1
fi

if [[ ! -d test ]]; then
    echo "no test suit to run in $PWD"
    exit 1
fi

yarn run mocha --require ts-node/register \
    $(find ./test -type f -name "*.ts" -print)
