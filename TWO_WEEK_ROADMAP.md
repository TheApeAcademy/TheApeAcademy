# 📅 2-Week Production Implementation Roadmap

**Start Date:** This week (Feb 8-12, 2026)  
**Go-Live:** February 22, 2026 (2 weeks)  
**Team:** 1-2 developers working full-time  
**Total Hours:** ~70 hours

---

## Week 1: Foundation & Core Implementation

### Day 1 (Friday, Feb 8): Planning & Setup (8 hours)

**Morning (08:00-12:00): Planning**
- [ ] Read: [SYSTEM_CONTRACT.md](SYSTEM_CONTRACT.md) (40 min)
- [ ] Read: [IMPLEMENTATION_PLAN_11_ISSUES.md](IMPLEMENTATION_PLAN_11_ISSUES.md) (1 hr)
- [ ] Gather Figma-imported frontend files from your system (30 min)
- [ ] Create implementation checklist (color code: critical vs nice-to-have)
- [ ] Setup git branch: `git checkout -b production-setup`

**Afternoon (12:00-17:00): Infrastructure Setup**
- [ ] Generate JWT_SECRET: `openssl rand -base64 32` (5 min)
- [ ] Get Flutterwave LIVE keys from dashboard (10 min)
- [ ] Create production .env file (15 min)
- [ ] Install packages: rate-limit, winston, nodemailer, sentry (10 min)
- [ ] Create logs/ directory (5 min)
- [ ] Verify Node version: `node --version` (should be 18+)
- [ ] Verify Docker is running: `docker ps` (5 min)
- [ ] Start docker-compose database: `docker-compose up -d postgres` (2 min)
- [ ] Test database connection: `npm run db:migrate` (5 min)
- [ ] Commit: "chore: setup production environment"

**End of Day 1 Status:**
- ✓ Environment ready
- ✓ Database online
- ✓ Git branch created
- ✓ All packages installed

---

### Day 2 (Monday, Feb 10): Logger & Validation (8 hours)

**Morning (08:00-12:00): Winston Logger Implementation**
- [ ] Create `server/src/utils/logger.mjs` (30 min)
  - ConsoleTransport for local development
  - FileTransport for error.log and combined.log
- [ ] Update `server/src/middleware/errorHandler.mjs` to use logger (20 min)
- [ ] Add logger calls to existing endpoints (1 hr)
- [ ] Create logs/ folder and verify it populates (10 min)
- [ ] Test: `npm run server:dev` → see logs in console AND files (20 min)
- [ ] Commit: "feat: add Winston logging system"

**Afternoon (12:00-17:00): Joi Input Validation**
- [ ] Create `server/src/utils/validation.mjs` with all schemas (1 hr)
  - signup, login, createAssignment, initiatePayment schemas
- [ ] Create validateBody and validateQuery middleware (20 min)
- [ ] Add validation to all routes (1.5 hrs)
  - Auth routes
  - Assignment routes
  - Payment routes
- [ ] Test with bad input: `curl -X POST ... -d '{"email":"invalid"}'` (20 min)
- [ ] Verify 400 responses with clear messages (10 min)
- [ ] Commit: "feat: add comprehensive input validation"

**End of Day 2 Status:**
- ✓ Logger writes to files
- ✓ Input validation on all endpoints
- ✓ Error messages clearer

---

### Day 3 (Tuesday, Feb 11): Rate Limiting & Email (8 hours)

**Morning (08:00-12:00): Rate Limiting**
- [ ] Install express-rate-limit (2 min)
- [ ] Add rate limiting to [server/index.mjs](server/index.mjs) (20 min)
  - General: 100 req/15min
  - Auth: 5 req/15min
  - Payments: 10 req/1min
- [ ] Test rate limiting (30 min)
  - Rapid-fire requests should get 429 after limit
  - Different IPs should have separate limits
- [ ] Document rate limits in documentation (20 min)
- [ ] Commit: "feat: add rate limiting to prevent abuse"

**Afternoon (12:00-17:00): Email Service**
- [ ] Install nodemailer (2 min)
- [ ] Create `server/src/services/email.mjs` (1 hr)
  - Support Gmail, SendGrid, custom SMTP
  - 4 email templates: verify, submission, payment, reset
- [ ] Update .env with EMAIL_* variables (10 min)
- [ ] Test email sending with test email address (20 min)
- [ ] If using Gmail, setup App Password (15 min)
- [ ] Create tests for email service (30 min)
- [ ] Commit: "feat: add email service with multiple templates"

**End of Day 3 Status:**
- ✓ Rate limiting active (prevents abuse)
- ✓ Email service functional
- ✓ Can send signup verification emails

---

### Day 4 (Wednesday, Feb 12): Payment Controller & Admin (8 hours)

**Morning (08:00-12:00): Complete Payment Controller**
- [ ] Replace `server/src/controllers/payment.mjs` with full implementation (1 hr)
  - initiatePayment: creates payment intent
  - verifyPayment: verifies with Flutterwave API
  - completePayment: MISSING METHOD - now implemented
  - getPayment: retrieve single payment
  - getUserPayments: list user payments
- [ ] Update `server/src/utils/flutterwave.mjs` (30 min)
  - Better error handling
  - Support both transaction ID and reference lookup
  - Detailed logging
- [ ] Update `server/src/routes/payment.mjs` with all endpoints (20 min)
- [ ] Test full payment flow (30 min)
  - POST initiate → GET verify → POST complete
- [ ] Commit: "feat: complete payment controller implementation"

**Afternoon (12:00-17:00): Admin Endpoints & Roles**
- [ ] Add role field to Prisma schema (10 min)
  - Run migration: `npm run db:migrate` (5 min)
- [ ] Create `server/src/middleware/admin.mjs` (20 min)
- [ ] Create `server/src/controllers/admin.mjs` (1 hr)
  - listAssignments, updateAssignmentStatus
  - listPayments, listUsers, updateUserRole
  - getStats (dashboard metrics)
- [ ] Create `server/src/routes/admin.mjs` (20 min)
- [ ] Add admin routes to [server/index.mjs](server/index.mjs) (5 min)
- [ ] Test admin endpoints (30 min)
  - Create admin user manually in database
  - Test permissions (non-admin should get 403)
- [ ] Commit: "feat: add admin dashboard endpoints and role-based access"

**End of Day 4 Status:**
- ✓ Payment workflow complete
- ✓ Admin can manage assignments
- ✓ User roles implemented

**End of Week 1:**
- ✓ All critical features implemented (logging, validation, rate limiting, payments, admin)
- ✓ 5 of 11 issues COMPLETE
- ✓ API functionally mature
- Ready for frontend integration

---

## Week 2: Webhooks, Backups, Frontend Integration, & Testing

### Day 5 (Thursday, Feb 13): Webhooks & Backups (8 hours)

**Morning (08:00-12:00): Flutterwave Webhooks**
- [ ] Create `server/src/routes/webhooks.mjs` (1 hr)
  - Verify webhook signature
  - Handle charge.completed event
  - Update payment status
  - Update assignment status on success
- [ ] Add webhooks route to [server/index.mjs](server/index.mjs) (5 min)
- [ ] Configure webhook in Flutterwave dashboard (15 min)
  - URL: https://yourdomain.com/api/webhooks/flutterwave (or ngrok for testing)
  - Events: charge.completed
- [ ] Test webhook locally with ngrok (30 min)
  - npm install -g ngrok
  - ngrok http 3000
  - Use ngrok URL in Flutterwave dashboard
- [ ] Verify payment status updates async (20 min)
- [ ] Commit: "feat: add Flutterwave async webhook handling"

**Afternoon (12:00-17:00): Database Backups**
- [ ] Create [backup.sh](backup.sh) script (30 min)
  - Docker-based backup
  - Compression
  - Auto-cleanup (30 day retention)
  -Logging
- [ ] Test backup script: `./backup.sh` (15 min)
- [ ] Setup cron job for daily backups at 2 AM (20 min)
- [ ] Test restore process (30 min)
  - Delete some data intentionally
  - Restore from backup
  - Verify data restored
- [ ] Document backup procedure (20 min)
- [ ] Commit: "feat: add automated database backup system"

**End of Day 5 Status:**
- ✓ Webhooks operational (async payment handling)
- ✓ Backups automated
- ✓ 7 of 11 issues COMPLETE

---

### Day 6 (Friday, Feb 14): Error Tracking & Figma Frontend Integration (8 hours)

**Morning (08:00-12:00): Sentry Error Tracking**
- [ ] Create Sentry account & project at https://sentry.io (15 min)
- [ ] Install @sentry/node (2 min)
- [ ] Configure Sentry in [server/index.mjs](server/index.mjs) (20 min)
- [ ] Add error capture to controllers (30 min)
- [ ] Test error reporting: trigger an error, verify in Sentry dashboard (20 min)
- [ ] Setup alerts for critical errors (15 min)
- [ ] Commit: "feat: add Sentry error tracking"

**Afternoon (12:00-17:00): Frontend Integration Preparation**
- [ ] Identify where your Figma-imported folder is located (10 min)
- [ ] Create `/client` folder structure: (20 min)
  ```
  /client
  ├── src/
  │   ├── pages/
  │   ├── components/
  │   ├── services/
  │   └── ...
  ├── package.json
  ├── vite.config.ts
  └── tsconfig.json
  ```
- [ ] Copy Figma files into `/client/src` (30 min)
- [ ] Update `/client/package.json` with frontend dependencies (20 min)
  - react, react-dom, react-router-dom, axios, etc.
  - Remove backend dependencies (express, prisma, etc.)
- [ ] Create `/client/vite.config.ts` for Vite (20 min)
- [ ] Create `/client/.env.example` (10 min)
- [ ] Update root [package.json](package.json) as workspace (if needed) (10 min)
- [ ] Commit: "feat: integrate Figma-imported frontend structure"

**End of Day 6 Status:**
- ✓ Error tracking live
- ✓ Frontend folder created
- ✓ 8 of 11 issues COMPLETE + Frontend structure ready

---

### Day 7 (Monday, Feb 17): Frontend Build & Testing (8 hours)

**Morning (08:00-12:00): Frontend Build & API Connection**
- [ ] From `/client` folder: `npm install` (5 min)
- [ ] Create API service in `/client/src/services/api.ts` (30 min)
  - Axios instance
  - Auth header injection
  - Error handling
  - VITE_API_URL environment variable
- [ ] Update payment form component to work with real API (1 hr)
  - Call POST /api/payments/initiate
  - Get Flutterwave checkout data
  - Redirect to Flutterwave
- [ ] Create payment callback page `/client/src/pages/PaymentCallback.tsx` (30 min)
  - Parse tx_ref from URL
  - Call GET /api/payments/verify/:tx_ref
  - Update UI based on payment status
- [ ] Test frontend build: `npm run build` from /client (20 min)
- [ ] Commit: "feat: integrate frontend with payment API"

**Afternoon (12:00-17:00): End-to-End Testing**
- [ ] Start both servers (in separate terminals): (10 min)
  - Terminal 1: `npm run server:dev` (backend on :3000)
  - Terminal 2: `cd client && npm run dev` (frontend on :5174)
- [ ] Test complete user flow: (2 hrs)
  - [ ] Signup → email verification
  - [ ] Login → get JWT token
  - [ ] Browse regions
  - [ ] Submit test assignment
  - [ ] Initiate payment
  - [ ] Complete payment on Flutterwave
  - [ ] Verify payment in database
  - [ ] Check assignment status updated
- [ ] Test admin endpoints: (30 min)
  - [ ] Admin login
  - [ ] List all assignments
  - [ ] Update assignment status
  - [ ] View statistics
- [ ] Test error scenarios: (30 min)
  - [ ] Bad credentials
  - [ ] Rate limit exceeded
  - [ ] Invalid input
  - [ ] Missing required fields
- [ ] Document test results (20 min)
- [ ] Commit: "test: end-to-end testing complete"

**End of Day 7 Status:**
- ✓ Frontend connected to backend
- ✓ Full payment flow tested
- ✓ Admin features tested
- ✓ Ready for production deployment

---

### Day 8 (Tuesday, Feb 18): Security & Hardening (8 hours)

**Morning (08:00-12:00): HTTPS & Security Headers**
- [ ] Add HSTS header for HTTPS enforcement (15 min)
- [ ] Setup Helmet middleware improvements (20 min)
- [ ] Configure CSP (Content Security Policy) (30 min)
- [ ] If self-hosted: Get SSL cert from Let's Encrypt (30 min)
  - Or use cloud provider's AUTO HTTPS
- [ ] Test HTTPS locally with ngrok (30 min)
- [ ] Verify no hardcoded secrets in code: `grep -r "password\|secret\|api_key" server/ client/` (15 min)
- [ ] Remove from git history if found (10 min)
- [ ] Commit: "security: add HTTPS and security headers"

**Afternoon (12:00-17:00): Pre-Launch Checklist**
- [ ] Create production .env file with real values (30 min)
  - DATABASE_URL (production database)
  - JWT_SECRET (your generated one)
  - FLUTTERWAVE keys (LIVE, not TEST)
  - EMAIL credentials
  - SENTRY_DSN
  - API_BASE_URL (production domain)
- [ ] Build frontend: `cd client && npm run build` (10 min)
- [ ] Copy dist/ to static serving (if not using separate frontend) (10 min)
- [ ] Review Dockerfile: update if needed (20 min)
- [ ] Review docker-compose.yml: update if needed (20 min)
- [ ] Test Docker build locally: `docker build -t apeacademy:latest .` (15 min)
- [ ] Create DEPLOYMENT_CHECKLIST.md (30 min)
- [ ] Final git commit: "chore: production ready - all 11 issues resolved"
- [ ] Create git tag: `git tag v1.0.0-production`
- [ ] Push to main branch: `git push origin production-setup` → Create PR
- [ ] Switch to main: `git checkout main && git merge production-setup`
- [ ] Commit: "release: v1.0.0 - production ready"

**End of Day 8 Status:**
- ✓ All 11 critical issues RESOLVED
- ✓ HTTPS configured
- ✓ All production env vars set
- ✓ Code review complete
- ✓ Ready for cloud deployment

---

## Day 9-14: Deployment & Launch

### Day 9 (Wednesday, Feb 19): Cloud Deployment Decision (4 hours)

**Choose ONE platform:**

#### Option A: Railway.app (Recommended) - 2 hours
```bash
# 1. Create Railway account
# 2. Create new project
# 3. Connect to GitHub repo
# 4. Add PostgreSQL service (auto-configured)
# 5. Set environment variables (copy from .env)
# 6. Deploy (automatic on git push)
# Time: 1-2 hours
```

#### Option B: Heroku - 2 hours
```bash
# 1. Create Heroku account
# 2. Create new app
# 3. Add PostgreSQL addon
# 4. Set env variables: heroku config:set VAR=value
# 5. Push to Heroku: git push heroku main
# Time: 1-2 hours
```

#### Option C: AWS EC2 - 4 hours
```bash
# More complex, but full control
# Would take full Day 9-10
```

**Recommendation:** Use **Railway** - easiest, free tier available, auto HTTPS, zero downtime deploys

---

### Days 10-11 (Thu-Fri, Feb 20-21): Staging & QA (16 hours)

**Day 10: Staging Environment**
- [ ] Deploy to staging URL (30 min)
- [ ] Run full test suite again (2 hrs)
- [ ] Perform load testing with k6 or Artillery (1 hr)
- [ ] Check logs for errors (30 min)
- [ ] Verify backup is running on production schedule (30 min)
- [ ] Test email delivery (30 min)
- [ ] Test Sentry alerts (30 min)

**Day 11: Final QA & Launch Prep**
- [ ] Get stakeholder approval (1 hr)
- [ ] Create launch communication (30 min)
- [ ] Backup production database (5 min)
- [ ] Create rollback plan documented (1 hr)
- [ ] Schedule monitoring dashboard (30 min)
- [ ] Final security check (1 hr)
- [ ] Prepare incident response plan (1 hr)

---

### Day 12-14 (Mon-Wed, Feb 24-26): Production Launch & Monitoring

**Day 12: Go-Live**
- [ ] Deploy to production (30 min)
- [ ] Verify all endpoints responding (15 min)
- [ ] Monitor logs for errors (1 hr)
- [ ] Test payment flow on production (30 min)
- [ ] Announce launch (email, social media) (30 min)
- [ ] Monitor dashboard continuously (available 8am-8pm)

**Day 13-14: Post-Launch Support**
- [ ] Monitor error rates (Sentry)
- [ ] Monitor response times
- [ ] Fix any production issues immediately
- [ ] Gather user feedback
- [ ] Plan follow-up improvements

---

## 2-Week Completion Breakdown

| Week | Days | Focus | Issues Resolved | Status |
|------|------|-------|-----------------|--------|
| 1 | 1-4 | Logging, Validation, Rate Limit, Email, Payment, Admin | 6/11 | ✅ Complete |
| 2 | 5-8 | Webhooks, Backups, Error Tracking, Frontend, Security | 11/11 | ✅ Complete |
| 2 | 9-14 | Deployment, QA, Launch, Monitoring | N/A | ✅ In Production |

---

## Daily Standup Template

**Each morning (9:00 AM):**
```
Yesterday:
- Completed: [features from checklist]
- Blockers: [any issues?]
- Code review: [PRs merged?]

Today:
- Will complete: [day's checklist items]
- Estimated completion: [hours]
- Risk level: [Green/Yellow/Red]
```

---

## Git Workflow During Implementation

```bash
# Week 1-2 Development
git checkout -b production-setup
git commit -m "feat: [daily feature]"  # Daily commits

# End of Week 2
git push origin production-setup
# Create PR, get review, merge to main
git checkout main
git merge production-setup
git tag v1.0.0-production
git push --tags
```

---

## Success Criteria (Must ALL Pass)

### Backend
- [ ] All 11 critical issues resolved
- [ ] `npm run server:dev` starts without errors
- [ ] `GET /api/health` responds in <100ms
- [ ] Database connection verified on startup
- [ ] All imports are valid (no circular imports)
- [ ] Logging writes to files in logs/
- [ ] Rate limiting returns 429 when exceeded
- [ ] Payment flow end-to-end works

### Frontend
- [ ] `npm run dev` starts without errors
- [ ] Connects to API at configured URL
- [ ] Payment flow can complete
- [ ] Forms validate input
- [ ] Auth tokens persist in localStorage
- [ ] Can submit assignment with file upload

### Production
- [ ] `npm run build` completes without errors
- [ ] Docker image builds: `docker build -t apeacademy`
- [ ] Docker container runs: `docker run -p 3000:3000`
- [ ] HTTPS working (no insecure warnings)
- [ ] Database backups running on schedule
- [ ] Error reporting working (Sentry)
- [ ] Email notifications sending
- [ ] Monitoring alerts configured

---

## Troubleshooting During Implementation

### If stuck on an issue:
1. **Check logs:** `tail -f logs/combined.log`
2. **Check errors:** `npm run server:dev 2>&1 | grep -i error`
3. **Read the error:** Copy full error message, search documentation
4. **Minimal test:** Isolate the problem to 1 feature
5. **Rollback:** If you break something, `git checkout -- file.mjs`

### If running behind:
1. **Parallel work:** Have 2 developers on different features
2. **Skip polish:** Focus on function, not perfect code
3. **Extend timeline:** Better late than broken
4. **Prioritize:** Do critical issues first, nice-to-haves later
5. **Remove scope:** Cut features that aren't core

---

## Communication Plan

**Stakeholders should know:**
- Week 1: Backend core features being built
- Week 2: Frontend integrated, testing beginning
- Week 2 (Thu-Fri): In staging, final QA
- Week 3 (Mon): LAUNCH

**Red flags to communicate immediately:**
- Any blocking issue >4 hours
- Database issues
- Security vulnerabilities
- 3rd party service failures

---

## Post-Launch: First 2 Weeks Monitoring

**Daily (first week after launch):**
- [ ] Error rate <0.1%
- [ ] Response time <200ms p95
- [ ] No Sentry critical alerts
- [ ] Database backups completing
- [ ] No customer complaints

**Weekly (after first week):**
- [ ] Performance baseline established
- [ ] All features being used
- [ ] Zero data loss incidents
- [ ] Enough revenue to sustain

---

## You've Got This! 🚀

**Timeline:** Realistic and achievable  
**Complexity:** Well-defined, broken into daily tasks  
**Risk:** Low - following established patterns  
**Probability of success:** Very High (95%)  

**Most likely delays:**
- Frontend integration (1-2 days)
- Unexpected bugs in testing (1-2 days)
- Cloud deployment issues (1-2 days)

**Mitigation:**
- Buffer days 13-14 for catch-up
- Have experienced developer available for support
- Test everything before launch

