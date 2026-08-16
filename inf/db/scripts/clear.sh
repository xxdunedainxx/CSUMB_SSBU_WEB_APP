#!/bin/bash
# Usage: bash inf/db/scripts/clear.sh
# Stops the container and deletes the postgres data volume for a fresh init.

bash "$(dirname "${BASH_SOURCE[0]}")/stop.sh"
docker volume rm postgres_data && echo "Removed postgres_data volume" || echo "No postgres_data volume found"
