#!/bin/bash

#####################################################################
# ApeAcademy Database Backup Script
# Backs up PostgreSQL database with compression and rotation
# 
# Usage:
#   bash backup.sh                          # One-time backup
#   crontab -e                              # Add for scheduled backups
#   0 2 * * * cd /app && bash backup.sh    # Daily at 2 AM
#
# Environment Variables (from .env):
#   DATABASE_URL=postgresql://user:pass@localhost:5432/apeacademy
#   BACKUP_RETENTION_DAYS=7                # Keep backups for 7 days
#####################################################################

set -e  # Exit on error

# Configuration
BACKUP_DIR="./backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="apeacademy_backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
log_info() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

# Parse DATABASE_URL
# Expected format: postgresql://user:password@host:port/database
parse_database_url() {
  local url="$1"
  
  # Remove postgresql:// prefix
  url="${url#postgresql://}"
  
  # Extract user and password
  local user_pass="${url%@*}"
  DB_USER="${user_pass%:*}"
  DB_PASS="${user_pass#*:}"
  
  # Extract host, port, and database
  local host_db="${url#*@}"
  local host_port="${host_db%/*}"
  DB_HOST="${host_port%:*}"
  DB_PORT="${host_port#*:}"
  DB_NAME="${host_db#*/}"
}

# Main backup function
main() {
  log_info "Starting ApeAcademy database backup..."
  
  # Load environment variables
  if [ -f .env ]; then
    set -a
    source .env
    set +a
  else
    log_error "No .env file found. Please create one in the project root."
    exit 1
  fi
  
  # Validate DATABASE_URL
  if [ -z "$DATABASE_URL" ]; then
    log_error "DATABASE_URL not set in .env"
    exit 1
  fi
  
  # Parse database connection details
  parse_database_url "$DATABASE_URL"
  
  # Create backup directory if it doesn't exist
  if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
  fi
  
  log_info "Database: $DB_NAME"
  log_info "Host: $DB_HOST:$DB_PORT"
  log_info "Backup file: $BACKUP_PATH"
  
  # Perform backup with compression
  # Using pg_dump to backup and gzip to compress
  if PGPASSWORD="$DB_PASS" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --verbose \
    | gzip > "$BACKUP_PATH" 2>&1; then
    
    log_info "Backup completed successfully"
    
    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log_info "Backup size: $FILE_SIZE"
    
  else
    log_error "Backup failed. Check DATABASE_URL and credentials."
    exit 1
  fi
  
  # Cleanup old backups
  log_info "Cleaning up backups older than $RETENTION_DAYS days..."
  
  if command -v find &> /dev/null; then
    BACKUP_COUNT=$(find "$BACKUP_DIR" -name "apeacademy_backup_*.sql.gz" -type f | wc -l)
    find "$BACKUP_DIR" -name "apeacademy_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    REMAINING=$(find "$BACKUP_DIR" -name "apeacademy_backup_*.sql.gz" -type f | wc -l)
    
    log_info "Found $BACKUP_COUNT backups, kept $REMAINING (deleted $(($BACKUP_COUNT - $REMAINING)))"
  else
    log_warn "find command not available, skipping cleanup"
  fi
  
  log_info "Backup process completed successfully!"
  log_info "To restore: gunzip < $BACKUP_PATH | psql -h $DB_HOST -U $DB_USER -d $DB_NAME"
}

# Run main function
main "$@"
