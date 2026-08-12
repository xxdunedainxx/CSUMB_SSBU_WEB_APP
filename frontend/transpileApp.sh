#!/bin/bash

echo "Build frontend"
# VITE_MODE=production NODE_ENV=production
NODE_OPTIONS=--openssl-legacy-provider npm run build