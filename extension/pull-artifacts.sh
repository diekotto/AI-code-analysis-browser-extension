#!/bin/bash

# This script is used to pull artifacts from the build sections of the extension and copy them to the root of the extension

SIDEPANEL_BUILD_PATH="./sidepanel/dist"
POPUP_BUILD_PATH="./popup/dist"

EXTENSION_CODE_PATH="./src"

# Remove the existing Sidepanel build
rm -rf $EXTENSION_CODE_PATH/sidepanel

# Remove the existing Popup build
rm -rf $EXTENSION_CODE_PATH/popup

# Copy the new Sidepanel build content
cp -r $SIDEPANEL_BUILD_PATH/* $EXTENSION_CODE_PATH

# Copy the new Popup build

# cp -r $POPUP_BUILD_PATH/* $EXTENSION_CODE_PATH

