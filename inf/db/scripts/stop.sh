#!/bin/bash
# Usage: ./inf/db/scripts/stop.sh
docker stop csumbdbpg && docker rm csumbdbpg \
 && echo "Stopped and removed running postgres containers" \
 || echo "No running postgres container detected"