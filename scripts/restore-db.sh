#!/bin/bash

# Database Restore Script for PostgreSQL
# Usage: ./scripts/restore-db.sh [backup-file]
# Example: ./scripts/restore-db.sh .backups/apeacademy_backup_20260213_120000.sql.gz

set -e

if [ -z "$1" ]; then
  echo "❌ Usage: $0 [backup-file]"
  echo "Example: $0 .backups/apeacademy_backup_20260213_120000.sql.gz"
  echo ""
  echo "Available backups:"
  ls -lh .backups/apeacademy_backup_*.sql.gz 2>/dev/null || echo "No backups found"
  exit 1
fi

BACKUP_FILE="$1"
DB_NAME="${DATABASE_DB:-apeacademy}"
DB_USER="${POSTGRES_USER:-apeacademy}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "❌ Backup file not found: $BACKUP_FILE"
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  ApeAcademy Database Restore"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 Database: $DB_NAME"
echo "🖥️  Host: $DB_HOST:$DB_PORT"
echo "💾 Backup: $BACKUP_FILE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "⚠️  WARNING: This will REPLACE all data in the database!"
read -p "Are you sure? Type 'yes' to confirm: " -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo "❌ Restore cancelled."
  exit 1
fi

echo "🔄 Restoring database..."

# Determine if file is gzipped
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose
else
  PGPASSWORD="$POSTGRES_PASSWORD" psql \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    < "$BACKUP_FILE"
fi

if [ $? -eq 0 ]; then
  echo ""
  echo "✅ Database restore completed successfully!"
else
  echo ""
  echo "❌ Restore failed!"
  exit 1
fi

echo "✨ Restore process completed!"
echo ""
