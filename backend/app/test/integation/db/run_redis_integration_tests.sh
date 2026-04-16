#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "${SCRIPT_DIR}/../../.." && pwd)"

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

bash "${SCRIPT_DIR}/redis_setup.sh"

cleanup() {
  bash "${SCRIPT_DIR}/redis_teardown.sh"
}
trap cleanup EXIT

cd "${APP_ROOT}"
"${PYTHON_BIN}" -m unittest test.integation.db.RedisConnectorTests
