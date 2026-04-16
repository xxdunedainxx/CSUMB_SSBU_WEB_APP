#!/bin/bash
set -euo pipefail

CONTAINER_NAME="redis-integration-test"

echo "Stopping Redis integration container..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Redis integration test container removed."
