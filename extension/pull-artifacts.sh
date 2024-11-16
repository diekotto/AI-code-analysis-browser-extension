#!/bin/bash

# This script is used to pull artifacts from the build sections of the extension and copy them to the root of the extension

SIDEPANEL_BUILD_PATH="./sidepanel/dist"

EXTENSION_CODE_PATH="./src"

# Remove the existing Sidepanel build
rm -rf $EXTENSION_CODE_PATH/sidepanel
# Copy the new Sidepanel build content
cp -r $SIDEPANEL_BUILD_PATH/* $EXTENSION_CODE_PATH
