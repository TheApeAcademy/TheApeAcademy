#!/bin/bash

# Docker Database Backup Script
# Backs up PostgreSQL database running in Docker container
# Usage: ./scripts/backup-db-docker.sh [container-name] [backup-directory]

set -e

# Configuration
CONTAINER_NAME="${1:-apeacademy-db}"
BACKUP_DIR="${2:-.backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/apeacademy_backup_docker_$TIMESTAMP.sql"
DB_NAME="apeacademy"
DB_USER="apeacademy"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 ApeAcademy Docker Database Backup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Container: $CONTAINER_NAME"
echo "📦 Database: $DB_NAME"
echo "💾 Backup: $BACKUP_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if container exists and is running
if ! docker ps -a --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "❌ Docker container '$CONTAINER_NAME' not found!"
  echo "Available containers:"
  docker ps -a --format '{{.Names}}'
  exit 1
fi

if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
  echo "⚠️  Container '$CONTAINER_NAME' is not running. Starting it..."
  docker start "$CONTAINER_NAME"
  sleep 5
fi

echo "⏳ Creating backup..."

# Perform backup using docker exec
docker exec "$CONTAINER_NAME" \
  pg_dump \
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
  
  # Clean up old backups (older than 7 days by default)
  RETENTION_DAYS="${3:-7}"
  echo "🧹 Cleaning up backups older than $RETENTION_DAYS days..."
  find "$BACKUP_DIR" -name "apeacademy_backup_docker_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete
  
  # List recent backups
  echo ""
  echo "📋 Recent backups:"
  ls -lh "$BACKUP_DIR"/apeacademy_backup_docker_*.sql.gz 2>/dev/null | tail -5
else
  echo "❌ Backup failed!"
  exit 1
fi

echo ""
echo "✨ Docker backup process completed!"
echo ""
