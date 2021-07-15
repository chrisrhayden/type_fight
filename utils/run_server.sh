#!/usr/bin/env bash

if [[ ! -e 'package.json' ]]; then
    echo "project not setup / missing package.json"

    exit 1
fi

yarn run webpack-cli || exit 1

yarn run http-server -c-1
