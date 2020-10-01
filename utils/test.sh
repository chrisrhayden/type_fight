#!/bin/bash

if [[ ! -f package.json ]]; then
    echo "no packag.json in $PWD"
    exit 1
fi

if [[ ! -d test ]]; then
    echo "no test suit to run in $PWD"
    exit 1
fi

if [[ $1 == --cov ]]; then
    yarn run nyc \
        yarn run mocha  --require ts-node/register \
            $(find ./test -type f -name "*test_*.ts" -print)
else
    yarn run mocha --compiler-options ./test/tsconfig.json \
        --require ts-node/register \
        $(find ./test -type f -name "*test_*.ts" -print)
fi
