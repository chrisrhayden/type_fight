#!/usr/bin/env bash

if [[ ! -e 'package.json' ]]; then
    echo "project not setup / missing package.json"

    exit 1
fi

yarn run tsc utils/make_spritesheet_json.ts || exit 1

node utils/make_spritesheet_json.js
