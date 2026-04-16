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
docker build -t "${IMAGE_NAME}" -f "${APP_ROOT}/docker/redis/Dockerfile" "${APP_ROOT}"

echo "Starting Redis integration container..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${HOST_PORT}:${CONTAINER_PORT}" \
  --restart=no \
  "${IMAGE_NAME}"

echo "Waiting for Redis to be ready..."
for i in {1..10}; do
  if docker exec "${CONTAINER_NAME}" redis-cli ping | grep -q PONG; then
    echo "Redis is ready."
    exit 0
  fi
  sleep 1
done

echo "Redis did not become ready in time."
exit 1
