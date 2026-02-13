# ⚡ Quick Reference - 11 Issues Implementation Card

Print this and check off as you implement each issue.

---

## 🎯 The 11 Critical Issues - Implementation Status

### ISSUE #1: Complete Payment Controller ✓
**Status:** Not started  
**Time:** 4 hours  
**File:** `server/src/controllers/payment.mjs`  

**Checklist:**
- [ ] Replace payment controller with full implementation (copy from IMPLEMENTATION_PLAN_11_ISSUES.md)
- [ ] Update payment routes to include 4 methods: initiatePayment, verifyPayment, completePayment, getPayment
- [ ] Update flutterwave utility with better verification
- [ ] Test: `curl -X POST http://localhost:3000/api/payments/initiate`
- [ ] Test: `curl http://localhost:3000/api/payments/verify/:tx_ref`
- [ ] Commit: "feat: complete payment controller implementation"

---

### ISSUE #2: Rate Limiting ✓
**Status:** Not started  
**Time:** 2 hours  
**File:** `server/index.mjs`  

**Checklist:**
- [ ] `npm install express-rate-limit`
- [ ] Copy rate limiting code to middleware section
- [ ] Apply to `/api/`, `/api/auth/login`, `/api/payments/initiate`
- [ ] Test: Rapid requests should get 429
- [ ] Commit: "feat: add rate limiting"

---

### ISSUE #3: Winston Logging ✓
**Status:** Not started  
**Time:** 3 hours  
**Files:** `server/src/utils/logger.mjs`, `server/src/middleware/errorHandler.mjs`  

**Checklist:**
- [ ] `npm install winston`
- [ ] Create logger.mjs with console + file outputs
- [ ] Update error handler to use logger
- [ ] Add logger calls to controllers
- [ ] Create logs/ directory
- [ ] Test: `npm run server:dev` → logs appear in logs/combined.log
- [ ] Commit: "feat: add Winston logging"

---

### ISSUE #4: Joi Input Validation ✓
**Status:** Not started  
**Time:** 3 hours  
**File:** `server/src/utils/validation.mjs`  

**Checklist:**
- [ ] `npm install joi` (should already be installed)
- [ ] Create validation.mjs with all schemas
- [ ] Create validateBody() and validateQuery() middleware
- [ ] Update routes to use validation
- [ ] Test: POST bad data, should get clear error message
- [ ] Commit: "feat: add comprehensive input validation"

---

### ISSUE #5: Email Service ✓
**Status:** Not started  
**Time:** 3 hours  
**File:** `server/src/services/email.mjs`  

**Checklist:**
- [ ] `npm install nodemailer`
- [ ] Create email.mjs with 4 templates
- [ ] Add EMAIL_* vars to .env
- [ ] For Gmail: Setup App Password (https://mail.google.com/mail/u/0/a/account)
- [ ] Test sending: EmailService.sendVerificationEmail()
- [ ] Commit: "feat: add email service"

---

### ISSUE #6: Admin Endpoints & Roles ✓
**Status:** Not started  
**Time:** 4 hours  
**Files:** `server/src/controllers/admin.mjs`, `server/src/routes/admin.mjs`, `server/src/middleware/admin.mjs`  

**Checklist:**
- [ ] Update prisma schema: add role field to User
- [ ] Run migration: `npm run db:migrate`
- [ ] Create admin middleware
- [ ] Create admin controller with 6 methods
- [ ] Create admin routes
- [ ] Add routes to server/index.mjs
- [ ] Set your user role to "admin" via SQL: `UPDATE "User" SET role='admin' WHERE email='your@email.com'`
- [ ] Test: GET /api/admin/stats (should return stats)
- [ ] Test: Get /api/admin/assignments (should return assignments)
- [ ] Commit: "feat: add role-based admin endpoints"

---

### ISSUE #7: HTTPS & Security ✓
**Status:** Not started  
**Time:** 2 hours  
**File:** `server/index.mjs`  

**Checklist:**
- [ ] If cloud (Railway/Heroku): Auto HTTPS provided ✓
- [ ] If self-hosted:
  - [ ] Get SSL cert: Let's Encrypt (certbot)
  - [ ] Update server/index.mjs with https config
- [ ] Add HSTS header via helmet
- [ ] Test: No insecure warnings in browser
- [ ] Commit: "security: enforce HTTPS"

---

### ISSUE #8: Database Backups ✓
**Status:** Not started  
**Time:** 2 hours  
**File:** `backup.sh`  

**Checklist:**
- [ ] Create backup.sh script (copy from IMPLEMENTATION_PLAN)
- [ ] `chmod +x backup.sh`
- [ ] Test backup: `./backup.sh` → verify backup_XXXXXXX.sql.gz created
- [ ] Test restore: Delete a user, restore from backup, verify user restored
- [ ] Add to crontab: `crontab -e` → `0 2 * * * /path/to/backup.sh`
- [ ] Verify cron running: Check logs/combined.log for backup completion
- [ ] Commit: "feat: add automated backups"

---

### ISSUE #9: Flutterwave Webhooks ✓
**Status:** Not started  
**Time:** 3 hours  
**File:** `server/src/routes/webhooks.mjs`  

**Checklist:**
- [ ] Create webhooks.mjs route
- [ ] Add to server/index.mjs: `app.use('/api/webhooks', webhookRoutes)`
- [ ] Configure Flutterwave dashboard:
  - Go to Settings → Webhooks
  - Add endpoint: https://yourdomain.com/api/webhooks/flutterwave
  - Select event: charge.completed
- [ ] For testing: Use ngrok: `ngrok http 3000`, use ngrok URL in Flutterwave
- [ ] Test: Complete a test payment, verify webhook updates status
- [ ] Commit: "feat: add Flutterwave webhook async payment handling"

---

### ISSUE #10: Database Migrations Strategy ✓
**Status:** Not started  
**Time:** 2 hours  
**File:** `package.json`  

**Checklist:**
- [ ] Update package.json scripts:
  - [ ] `db:migrate`: `prisma migrate dev`
  - [ ] `db:migrate:prod`: `prisma migrate deploy`
  - [ ] `db:push`: `prisma db push`
  - [ ] `db:seed`: optional seed script
  - [ ] `db:studio`: `prisma studio`
- [ ] Test: `npm run db:migrate` creates migrations/ folder
- [ ] Test: `npm run db:studio` opens database GUI
- [ ] Commit: "chore: document migration scripts"

---

### ISSUE #11: Sentry Error Tracking ✓
**Status:** Not started  
**Time:** 2 hours  
**File:** `server/index.mjs`  

**Checklist:**
- [ ] Create Sentry account: https://sentry.io
- [ ] Create project, copy DSN
- [ ] `npm install @sentry/node`
- [ ] Add to server/index.mjs (copy from IMPLEMENTATION_PLAN)
- [ ] Add SENTRY_DSN to .env
- [ ] Test: Trigger an error, verify it appears in Sentry dashboard
- [ ] Setup Slack alert (optional)
- [ ] Commit: "feat: add Sentry error tracking"

---

## ✅ Final Checklist

### Environment Setup
- [ ] Node.js v18+: `node --version`
- [ ] npm 8+: `npm --version`
- [ ] Docker running: `docker ps`
- [ ] PostgreSQL running: `docker-compose ps`
- [ ] Git branch created: `git branch`
- [ ] All packages installed: `npm install`

### Code Quality
- [ ] No `console.log()` in production code (use logger)
- [ ] All imports valid, no circular imports
- [ ] No hardcoded credentials in code
- [ ] All env vars in `.env.example`
- [ ] No typos in route paths

### Testing
- [ ] Backend starts: `npm run server:dev`
- [ ] Health check works: `curl http://localhost:3000/api/health`
- [ ] All endpoints respond
- [ ] Payment flow works end-to-end
- [ ] Admin endpoints require auth + role

### Pre-Launch
- [ ] Frontend built: `npm run build` (from /client)
- [ ] Docker-compose up works: `docker-compose up -d`
- [ ] Database migrations run: `npm run db:migrate`
- [ ] All secrets in .env (not in code)
- [ ] README updated
- [ ] DEPLOYMENT.md reviewed

---

## 🚨 Critical Commands

```bash
# Start backend
npm run server:dev

# Start frontend
cd client && npm run dev

# Test API
curl http://localhost:3000/api/health

# View logs
tail -f logs/combined.log

# Database
npm run db:migrate
npm run db:studio

# Backups
./backup.sh

# Build for production
npm run build
cd client && npm run build

# View Sentry errors
# Go to https://sentry.io → Projects → ApeAcademy
```

---

## 📊 Daily Progress Tracker

**Week 1:**
- [ ] Day 1: Planning, setup (logging, validation, rate limit installed)
- [ ] Day 2: Logger & Validation implemented
- [ ] Day 3: Rate limiting & Email working
- [ ] Day 4: Payment controller & Admin endpoints done

**Week 2:**
- [ ] Day 5: Webhooks & Backups operational
- [ ] Day 6: Sentry + Frontend structure ready
- [ ] Day 7: Frontend built, end-to-end tested
- [ ] Day 8: HTTPS, final checklist, ready to deploy
- [ ] Days 9-14: Staging, QA, Production launch

---

## 🔗 Key Files Reference

| Issue | Primary File | Secondary Files |
|-------|-------------|-----------------|
| 1 | controllers/payment.mjs | utils/flutterwave.mjs, routes/payment.mjs |
| 2 | index.mjs | - |
| 3 | utils/logger.mjs | middleware/errorHandler.mjs |
| 4 | utils/validation.mjs | All routes |
| 5 | services/email.mjs | .env |
| 6 | controllers/admin.mjs | routes/admin.mjs, middleware/admin.mjs, schema.prisma |
| 7 | index.mjs | Helmet config |
| 8 | backup.sh | - |
| 9 | routes/webhooks.mjs | index.mjs |
| 10 | package.json | - |
| 11 | index.mjs | .env |

---

## 💡 Pro Tips

1. **Commit frequently**: After each small feature
2. **Test as you go**: Don't wait until end to test
3. **Read logs**: 90% of bugs are in logs
4. **Use Postman**: Test APIs with nice UI instead of curl
5. **Backup often**: Especially before big changes
6. **Ask for help**: If stuck >2 hours, reach out

---

## Contact Info During Implementation

**If you get stuck:**
1. Check logs: `tail -f logs/combined.log`
2. Check related documentation
3. Search error message in Google/Stack Overflow
4. Read the code comments
5. Reach out for help

