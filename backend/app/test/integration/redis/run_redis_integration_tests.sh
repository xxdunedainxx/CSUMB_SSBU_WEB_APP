#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Try repo-root layout first (repo/inf/...), otherwise fall back to backend/app layout
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../../../" && pwd)"
if [ -f "${REPO_ROOT}/inf/redis/scripts/redis_setup.sh" ]; then
  APP_ROOT="${REPO_ROOT}"
else
  APP_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
fi

# Allow overriding the python binary (e.g., PYTHON_BIN="python" on Windows Git Bash)
PYTHON_BIN="${PYTHON_BIN:-python3}"

# Fallback to python if python3 is not present
if ! command -v "${PYTHON_BIN}" >/dev/null 2>&1; then
  if command -v python >/dev/null 2>&1; then
    PYTHON_BIN="python"
  else
    echo "Python is not available in this shell. Set PYTHON_BIN to a valid interpreter or install python3." >&2
    exit 1
  fi
fi

bash "${APP_ROOT}/inf/redis/scripts/redis_setup.sh"

cleanup() {
  bash "${APP_ROOT}/inf/redis/scripts/redis_teardown.sh"
}
trap cleanup EXIT

if [ -d "${APP_ROOT}/backend/app/test/integration" ]; then
  cd "${APP_ROOT}/backend/app"
else
  cd "${APP_ROOT}"
fi

"${PYTHON_BIN}" -m unittest test.integration.redis.RedisConnectorTests