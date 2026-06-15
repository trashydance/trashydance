#!/bin/sh
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [ -f "$SCRIPT_DIR/cert.pem" ] && [ -f "$SCRIPT_DIR/key.pem" ]; then
  echo "Certificates already exist. Remove them to regenerate."
  exit 0
fi

echo "Generating self-signed certificate..."
openssl req -x509 -newkey rsa:2048 -keyout "$SCRIPT_DIR/key.pem" -out "$SCRIPT_DIR/cert.pem" \
  -sha256 -days 365 -nodes \
  -subj "/C=IT/ST=Roma/L=Roma/O=42/OU=trashydance/CN=localhost"

echo "Certificates generated in $SCRIPT_DIR"
