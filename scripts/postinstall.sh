#!/bin/sh
if [ -d "node_modules/hyalus-fluentui-emoji" ]; then
    rm -rf public/fluentui-emoji
    cp -ar node_modules/hyalus-fluentui-emoji/dist/assets public/fluentui-emoji
fi