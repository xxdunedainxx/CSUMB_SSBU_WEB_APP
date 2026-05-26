#!/bin/bash
# Usage: ./scripts/build.sh

imageBase=${1:-"dev"}

echo "Building postgres db for '$imageBase'"

docker build . -t csumbdb --build-arg MODE=$imageBase