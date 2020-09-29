#!/bin/bash

if [[ -n $(ls -aA ./dist/ 2>/dev/null ) ]]; then
    rm -r ./dist/*
fi

for ff in $(find ./public -name "*bundle*.js"); do
    if [[ -f "$ff" ]]; then
        rm "$ff"
    fi
done
