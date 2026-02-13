#!/bin/bash

# Database Backup Script for PostgreSQL
# Usage: ./scripts/backup-db.sh [target-directory]
# Default: ./backups/

set -e

# Configuration
BACKUP_DIR="${1:-.backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/apeacademy_backup_$TIMESTAMP.sql"
DB_NAME="${DATABASE_DB:-apeacademy}"
DB_USER="${POSTGRES_USER:-apeacademy}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔄 ApeAcademy Database Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Database: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "💾 Backup: $BACKUP_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Perform backup
echo "⏳ Creating backup..."
PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  --verbose \
  --no-owner \
  --no-privileges \
  > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
  BACKUP_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "✅ Backup completed successfully!"
  echo "📏 Size: $BACKUP_SIZE"
  echo "💾 Location: $BACKUP_FILE"
  
  # Compress the backup
  echo "🗜️  Compressing backup..."
  gzip "$BACKUP_FILE"
  COMPRESSED_FILE="$BACKUP_FILE.gz"
  COMPRESSED_SIZE=$(du -h "$COMPRESSED_FILE" | cut -f1)
  echo "✅ Compressed: $COMPRESSED_SIZE"
  
  # Clean up old backups (older than retention days)
  echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "apeacademy_backup_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
  
  # List recent backups
  echo ""
  echo "📋 Recent backups:"
  ls -lh "$BACKUP_DIR"/apeacademy_backup_*.sql.gz 2>/dev/null | tail -5
else
  echo "❌ Backup failed!"
  exit 1
fi

echo ""
echo "✨ Backup process completed!"
echo ""
