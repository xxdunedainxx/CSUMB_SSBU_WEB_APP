#!/bin/bash
set -euo pipefail

CONTAINER_NAME="redis-integration-test"
IMAGE_NAME="redis-integration-test-image"
HOST_PORT=6379
CONTAINER_PORT=6379

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

echo "Stopping old Redis integration container if it exists..."
docker rm -f "${CONTAINER_NAME}" >/dev/null 2>&1 || true

echo "Building Redis integration image..."
docker build -t "${IMAGE_NAME}" -f "${APP_ROOT}/inf/redis/Dockerfile" "${APP_ROOT}"
