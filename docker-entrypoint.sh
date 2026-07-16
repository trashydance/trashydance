#!/bin/sh
set -e

echo "Running database migrations..."
./node_modules/.bin/drizzle-kit migrate

echo "Starting application..."
exec ./node_modules/.bin/tsx server.ts
