#!/bin/bash
# Usage: bash inf/db/scripts/stop.sh

if docker stop csumbdbpg && docker rm csumbdbpg; then
  echo "Stopped and removed running postgres containers"
else
  echo "No running postgres container detected"
fi
