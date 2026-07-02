#!/bin/bash
# Automated backup script for TrashyDance SQLite database and media files
set -e

BACKUP_DIR="data/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

# Check if zip command is available, fallback to tar if not
if command -v zip >/dev/null 2>&1; then
    # Backup database file and uploaded avatars/media using zip
    zip -r "$BACKUP_DIR/backup_$TIMESTAMP.zip" data/uploads/ > /dev/null
    echo "Backup successfully created: $BACKUP_DIR/backup_$TIMESTAMP.zip"
else
    # Fallback to tar
    tar -czf "$BACKUP_DIR/backup_$TIMESTAMP.tar.gz" data/uploads/
    echo "Backup successfully created: $BACKUP_DIR/backup_$TIMESTAMP.tar.gz"
fi

# Keep only the last 5 backups to save space
ls -tp "$BACKUP_DIR"/backup_* | grep -v '/$' | tail -n +6 | xargs -I {} rm -- {} 2>/dev/null || true
