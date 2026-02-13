# 🔄 Database Backup & Recovery Guide

## Overview

Automated database backups are critical for production systems. This guide covers setting up daily backups for PostgreSQL.

---

## Quick Start

### 1. Local Development (Linux/Mac)

```bash
# Make backup script executable
chmod +x scripts/backup-db.sh

# Create a backup manually
./scripts/backup-db.sh

# Backups are saved to .backups/ directory
ls .backups/
```

### 2. Docker Environment

```bash
# Make script executable
chmod +x scripts/backup-db-docker.sh

# Create backup from Docker container
./scripts/backup-db-docker.sh apeacademy-db .backups

# Or with custom retention (14 days)
./scripts/backup-db-docker.sh apeacademy-db .backups 14
```

### 3. Restore from Backup

```bash
# Make restore script executable
chmod +x scripts/restore-db.sh

# List available backups
ls .backups/apeacademy_backup_*.sql.gz

# Restore from specific backup
./scripts/restore-db.sh .backups/apeacademy_backup_20260213_120000.sql.gz
```

---

## Automated Daily Backups (Linux/Mac)

### Option A: Using Cron (Manual Setup)

1. **Edit crontab:**
```bash
crontab -e
```

2. **Add this line for daily 2 AM backup:**
```bash
0 2 * * * cd /path/to/Premium\ Student\ Assignment\ Platform && ./scripts/backup-db.sh >> logs/backup.log 2>&1
```

3. **For Docker-based backup:**
```bash
0 2 * * * cd /path/to/Premium\ Student\ Assignment\ Platform && ./scripts/backup-db-docker.sh apeacademy-db .backups >> logs/backup.log 2>&1
```

4. **Verify cron is set:**
```bash
crontab -l
```

### Option B: Using PM2 (Recommended for Production)

PM2 is already configured in your project!

1. **Create backup task:**
```bash
npm run pm2:start  # Already configured in package.json
```

2. **Add backup to ecosystem.config.cjs:**
```javascript
{
  apps: [
    // ... existing app config ...
    {
      name: 'backup-daily',
      script: './scripts/backup-db-docker.sh',
      args: 'apeacademy-db .backups',
      instances: 1,
      exec_mode: 'fork',
      cron_restart: '0 2 * * *', // Daily at 2 AM
      error_file: './logs/backup-error.log',
      out_file: './logs/backup-out.log',
    },
  ],
},
```

3. **Restart PM2:**
```bash
pm2 restart ecosystem.config.cjs
pm2 status
```

---

## Cloud Deployment Backups

### Railway.app
1. Go to Dashboard → Project Settings → Backups
2. Enable automatic daily backups
3. Set retention to 30 days

### AWS RDS
1. Enable automated backups in RDS console
2. Set backup retention period (7-35 days)
3. Enable multi-AZ for redundancy

### Heroku
1. Use Heroku PostgreSQL managed backups
2. Backups run automatically daily
3. Accessible via `heroku pg:backups`

### Google Cloud SQL
1. Enable automated backups in Cloud SQL console
2. Set backup window and retention
3. Point-in-time recovery included

---

## Backup Verification

### Test Restore Process Monthly

```bash
# DO THIS MONTHLY to verify backups work!

# 1. Create a test database
createdb apeacademy_test

# 2. Restore backup into test database
./scripts/restore-db.sh .backups/apeacademy_backup_latest.sql.gz

# 3. Verify data integrity
psql -d apeacademy_test -c "SELECT COUNT(*) FROM users;"
psql -d apeacademy_test -c "SELECT COUNT(*) FROM assignments;"
psql -d apeacademy_test -c "SELECT COUNT(*) FROM payments;"

# 4. Drop test database
dropdb apeacademy_test
```

### Monitor Backup Logs

```bash
# View latest backups
ls -lh .backups/ | tail -10

# Check backup log
tail -f logs/backup.log

# Monitor backup size growth
du -sh .backups/
```

---

## Backup Storage Strategy

### Local Development
- Keep 7 days of backups locally
- Automatic cleanup via script (older files deleted)
- Location: `.backups/`

### Production

**Tier 1: Database Server** (7 days)
```bash
# Daily backup, keep last 7 days
BACKUP_RETENTION_DAYS=7 ./scripts/backup-db-docker.sh
```

**Tier 2: Off-Server Storage** (30 days)
```bash
# Sync backups to external storage weekly
aws s3 cp .backups/ s3://apeacademy-backups/ --recursive --sse AES256
```

**Tier 3: Archive** (1 year)
```bash
# Archive monthly backup to cold storage
gsutil cp gs://backups/monthly/ gs://backups-archive/$(date +%Y-%m)-backup.sql.gz
```

---

## Backup Checklist

- [ ] Backup script is executable: `ls -l scripts/backup-db*.sh`
- [ ] Restore script is executable: `ls -l scripts/restore-db.sh`
- [ ] Cron job configured: `crontab -l`
- [ ] First backup created: `ls -la .backups/`
- [ ] Backup log exists: `tail logs/backup.log`
- [ ] Test restore completed: (monthly task)
- [ ] Off-server storage configured: (for production)
- [ ] Team knows restore procedure: (document location)

---

## Troubleshooting

### Backup fails: "pg_dump: command not found"
```bash
# Install PostgreSQL client tools
brew install postgresql  # Mac
sudo apt-get install postgresql-client  # Ubuntu/Debian
```

### Docker backup fails: "No such container"
```bash
# List running containers
docker ps

# Check container name
docker ps -a --format '{{.Names}}'

# Use correct container name
./scripts/backup-db-docker.sh correct-container-name
```

### Restore fails: "database already exists"
```bash
# Drop existing database (WARNING: loses data)
dropdb apeacademy

# Or restore to different database
createdb apeacademy_restored

# Modify restore script to use new database name
```

### Backup file too large
```bash
# Exclude large tables (e.g., logs)
pg_dump -U apeacademy -d apeacademy \
  --exclude-table=audit_logs \
  --exclude-table=error_logs \
  | gzip > backup.sql.gz
```

---

## Recovery Time Objectives (RTO)

| Scenario | Time | Action |
|----------|------|--------|
| Recent backup restore | 5 mins | `./scripts/restore-db.sh` |
| From cloud backup | 15-30 mins | Cloud console restore |
| From archive storage | 30-60 mins | Request archive, download, restore |
| Full server rebuild | 2-4 hours | Provision new server, restore, redeploy app |

---

## Next Steps

1. **Run first backup**: `./scripts/backup-db-docker.sh apeacademy-db`
2. **Setup cron**: Add to `crontab -e`
3. **Verify restoration**: Monthly test
4. **Document**: Share this guide with team
5. **Monitor**: Check backup logs weekly

---

**Last Updated:** February 13, 2026  
**Maintainer:** ApeAcademy DevOps Team  
