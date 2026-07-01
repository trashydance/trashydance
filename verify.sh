#!/bin/bash
set -e

echo "=== TypeScript Check ==="
pnpm exec tsc --noEmit

echo "=== Lint Check ==="
pnpm lint

echo "=== Unit Tests ==="
pnpm test

echo "=== Build Check ==="
pnpm build

echo ""
echo "=== ALL CHECKS PASSED ==="
