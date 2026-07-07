#!/bin/bash
# Automated backup script for TrashyDance SQLite database and media files
set -e

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="data/backups"
UPLOADS_DIR="data/uploads"
DB_PATH="${DATABASE_URL:-local.db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Check if zip command is available, fallback to tar if not
if command -v zip >/dev/null 2>&1; then
    # Backup database file and uploaded avatars/media using zip
    zip -r "$BACKUP_DIR/backup_$TIMESTAMP.zip" "$DB_PATH" "$UPLOADS_DIR" >/dev/null
    echo "Backup successfully created: $BACKUP_DIR/backup_$TIMESTAMP.zip"
else
    # Fallback to tar
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" "$DB_PATH" "$UPLOADS_DIR"
    echo "Backup successfully created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
fi

# Keep only the last 5 backups to save space
ls -1t "$BACKUP_DIR"/backup_* 2>/dev/null | tail -n +6 | xargs -r rm -- 2>/dev/null || true

