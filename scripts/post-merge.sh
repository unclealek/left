#!/usr/bin/env bash
set -euo pipefail

echo "Installing mobile dependencies..."
npm ci --no-audit --no-fund

echo "Installing admin dependencies..."
npm --prefix admin ci --no-audit --no-fund

echo "Post-merge setup complete."