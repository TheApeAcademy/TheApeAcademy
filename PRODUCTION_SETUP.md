# 🚀 Professional Production Setup Guide

## Option 1: PM2 (Recommended - Production Standard)

**PM2** is the industry-standard Node.js process manager. It handles:
- ✅ Auto-restart on crashes
- ✅ Load balancing across CPU cores
- ✅ Log management
- ✅ Memory monitoring
- ✅ Zero-downtime deployments

### Quick Start with PM2

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Build frontend
npm run build

# 3. Generate Prisma client
npm run db:generate

# 4. Run migrations (if first time)
npm run db:migrate

# 5. Start with PM2
npm run pm2:start

# 6. Check status
npm run pm2:status

# 7. View logs
npm run pm2:logs
```

**That's it! Server is now running in production mode with:**
- Auto-restart if it crashes
- 4 processes (one per CPU core, usually)
- Memory limits (500MB per process)
- Log files in `./logs/`

### Common PM2 Commands

```bash
# Status of all processes
npm run pm2:status

# View logs in real-time
npm run pm2:logs

# Restart the app
npm run pm2:restart

# Stop the app
npm run pm2:stop

# Start again
npm run pm2:start

# Delete the process from PM2
pm2 delete apeacademy

# View detailed stats
pm2 show apeacademy
```

---

## Option 2: Direct Node (Development/Testing)

For testing on your local machine:

```bash
# Development mode (auto-restart on file changes)
npm run server:dev

# Production mode (no restarts)
npm run server:prod

# Production mode with frontend
npm start
```

---

## Option 3: Docker (Enterprise)

For containerized deployments:

```bash
# Build Docker image
docker build -t apeacademy:latest .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  apeacademy:latest

# Or use Docker Compose
docker-compose up -d
docker-compose exec api npm run db:migrate
```

---

## Option 4: Systemd (Linux VPS)

For auto-start on server reboot:

Create `/etc/systemd/system/apeacademy.service`:

```ini
[Unit]
Description=ApeAcademy API Server
After=network.target
Wants=network-online.target

[Service]
User=www-data
WorkingDirectory=/var/www/apeacademy
ExecStart=/usr/bin/npm run server:prod
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable apeacademy
sudo systemctl start apeacademy
sudo systemctl status apeacademy
```

---

## Environment Setup (Critical!)

Create `.env` file in root with:

```env
# Server
NODE_ENV=production
PORT=3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/apeacademy

# JWT
JWT_SECRET=your-super-secure-random-32-character-string

# Flutterwave (Real Account)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE_xxxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE_xxxxxxxxxxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWENC_xxxxxxxxxxxxx

# URLs
API_BASE_URL=https://api.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

**⚠️ Never commit `.env` to Git!**

---

## Database Setup

### PostgreSQL Local (Development)

```bash
# Install PostgreSQL
sudo apt update && sudo apt install postgresql postgresql-contrib

# Start service
sudo systemctl start postgresql

# Create database
sudo -u postgres createdb apeacademy

# Set password
sudo -u postgres psql
postgres=# ALTER USER postgres WITH PASSWORD 'your_password';
postgres=# \q

# Update DATABASE_URL in .env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/apeacademy

# Run migrations
npm run db:migrate
```

### PostgreSQL Cloud (Production)

**Recommended:** Use managed PostgreSQL (avoid system admin overhead)

- **Railway.app**: $5/month, 1-click setup
- **Heroku**: $9/month, auto-backups
- **AWS RDS**: Pay-as-you-go, high availability
- **DigitalOcean**: $15/month, managed backups

Example Railway PostgreSQL URL:
```
postgresql://postgres:xyz@pg.railway.internal:5432/apeacademy
```

---

## Monitoring & Logs

### With PM2

```bash
# Real-time monitoring
pm2 monit

# Export logs
pm2 logs apeacademy > server.log

# Setup PM2 to save logs persistently
pm2 install pm2-logrotate
```

### With Systemd

```bash
# View logs
sudo journalctl -u apeacademy -f

# Last 50 lines
sudo journalctl -u apeacademy -n 50
```

### With Docker

```bash
# View logs
docker logs -f container_id

# Docker Compose
docker-compose logs -f api
```

---

## Health Checks

Your API has a health endpoint:

```bash
curl http://localhost:3000/api/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-02T10:30:00Z",
  "uptime": 3600,
  "environment": "production"
}
```

---

## Reverse Proxy (Nginx)

For production with domain name:

Create `/etc/nginx/sites-available/apeacademy`:

```nginx
upstream apeacademy {
    server localhost:3000;
}

server {
    listen 80;
    server_name api.yourdomain.com;
    client_max_body_size 50M;

    location / {
        proxy_pass http://apeacademy;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable it:

```bash
sudo ln -s /etc/nginx/sites-available/apeacademy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## SSL/HTTPS (Required for Production)

Using Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

This auto-updates your Nginx config with HTTPS!

---

## Performance Tuning

### Optimize Node.js

```bash
# Increase file descriptors
ulimit -n 65535

# Use more memory
NODE_OPTIONS="--max-old-space-size=4096" npm run server:prod
```

### PM2 Configuration

In `ecosystem.config.cjs`:

```javascript
instances: 'max',           // Use all CPU cores
exec_mode: 'cluster',       // Cluster mode for better performance
max_memory_restart: '500M', // Restart if exceeds 500MB
watch: false,               // Disable file watching in production
```

### Database Connection Pooling

Already configured in Prisma with:
- Min 2 connections
- Max 10 connections
- 5-minute idle timeout

---

## Troubleshooting

### Server Won't Start

```bash
# Check .env file exists
ls -la .env

# Check port 3000 is free
lsof -i :3000

# Check logs
npm run pm2:logs

# Check syntax
node -c server/index.mjs
```

### Database Connection Error

```bash
# Test database URL
psql postgresql://user:pass@localhost:5432/apeacademy

# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Re-run migrations
npm run db:push
```

### Out of Memory

```bash
# Increase Node.js heap
NODE_OPTIONS="--max-old-space-size=2048" npm run server:prod

# Check process memory
pm2 show apeacademy

# Clear old logs
pm2 install pm2-logrotate
```

### File Upload Issues

```bash
# Create uploads directory
mkdir -p uploads

# Fix permissions
chmod 755 uploads

# Check disk space
df -h
```

---

## Security Checklist

✅ Set strong `JWT_SECRET` (32+ random characters)
✅ Use HTTPS in production
✅ Update `FRONTEND_URL` to your domain
✅ Never commit `.env` to Git
✅ Rotate secrets regularly
✅ Enable firewall rules
✅ Set up rate limiting (via Nginx)
✅ Monitor logs for attacks
✅ Keep Node.js updated
✅ Keep dependencies updated: `npm audit fix`

---

## Summary: Quickest Production Setup

```bash
# 1. Setup (one time)
npm install --legacy-peer-deps
npm run build
npm run db:generate

# 2. Configure .env with your values
nano .env

# 3. Setup database
npm run db:migrate

# 4. Start production server
npm run pm2:start

# 5. Check it's running
npm run pm2:status

# Done! Server running at http://localhost:3000 ✅
```

---

## Next Steps

1. **Database**: Set up PostgreSQL (local or cloud)
2. **Flutterwave**: Create account and add credentials
3. **Domain**: Point your domain to your server IP
4. **SSL**: Setup HTTPS with Let's Encrypt
5. **Monitoring**: Setup PM2+ or cloud monitoring
6. **Backups**: Enable automated database backups

---

**Your API is now production-ready!** 🎉

Questions? Check BACKEND.md for API docs, DEPLOYMENT.md for platform-specific guides.
