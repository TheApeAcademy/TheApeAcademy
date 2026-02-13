# 📁 Complete File Modification Checklist

This document lists EVERY file you need to create or modify to implement all 11 issues.

---

## Files Already Existing (Just Update)

### 1. [server/index.mjs](server/index.mjs)
**Changes needed:**
- Add rate limiting imports
- Add rate limiting middleware
- Add Sentry initialization
- Add webhook routes
- Add admin routes
- Add request logging middleware

**Lines to modify:** ~20 lines added/modified

---

### 2. [server/src/config/index.mjs](server/src/config/index.mjs)
**Changes needed:**
- No changes if already has all required env vars
- Verify it has: FLUTTERWAVE_SECRET_KEY, JWT_SECRET, LOG_LEVEL

**Lines to modify:** ~0 lines

---

### 3. [server/src/middleware/errorHandler.mjs](server/src/middleware/errorHandler.mjs)
**Changes needed:**
- Import logger
- Replace console.error with logger.error
- Add better error formatting

**Lines to modify:** ~10 lines modified

---

### 4. [server/src/controllers/payment.mjs](server/src/controllers/payment.mjs)
**Changes needed:**
- Replace ENTIRE file with full implementation from IMPLEMENTATION_PLAN_11_ISSUES.md
- Add 5 methods: initiatePayment, verifyPayment, completePayment, getPayment, getUserPayments

**Lines to modify:** 198 → 300 lines (new implementation)

---

### 5. [server/src/routes/payment.mjs](server/src/routes/payment.mjs)
**Changes needed:**
- Add POST /payments/complete route
- Add GET /payments/:id route
- Add GET /payments/user/:userId route

**Lines to modify:** 3 new routes added

---

### 6. [server/src/utils/flutterwave.mjs](server/src/utils/flutterwave.mjs)
**Changes needed:**
- Update verifyFlutterwaveTransaction to support both transaction ID and reference
- Better error handling and logging
- Add buildFlutterwaveCheckout function

**Lines to modify:** ~50 lines modified/added

---

### 7. [prisma/schema.prisma](prisma/schema.prisma)
**Changes needed:**
- Add role field to User: `role String @default("user")`
- Add isEmailVerified field to User: `isEmailVerified Boolean @default(false)`

**Lines to modify:** 2 lines added

---

### 8. [package.json](package.json)
**Changes needed:**
- Add dev scripts: db:migrate:prod, db:seed, db:studio (optional)
- Verify all dependencies are present:
  - express-rate-limit
  - winston
  - nodemailer
  - @sentry/node
  - (Joi should already be there)

**Lines to modify:** ~3 lines added

---

### 9. [.env.example](.env.example)
**Changes needed:**
- Add email configuration:
  - EMAIL_HOST
  - EMAIL_PORT
  - EMAIL_SECURE
  - EMAIL_USER
  - EMAIL_PASS
  - EMAIL_FROM
- Add Sentry config: SENTRY_DSN
- Add logging: LOG_LEVEL
- Verify Flutterwave keys are listed

**Lines to modify:** ~8 lines added

---

### 10. [.gitignore](.gitignore)
**Changes needed:**
- Verify logs/ is ignored
- Verify .env is ignored
- Add backups/ to ignore list

**Lines to modify:** ~0 lines (should already be there)

---

## Files to CREATE (New)

### 11. [server/src/utils/logger.mjs](server/src/utils/logger.mjs)
**New file**  
**Content:** Winston logger configuration  
**Lines:** ~70 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #3
```

---

### 12. [server/src/utils/validation.mjs](server/src/utils/validation.mjs)
**New file**  
**Content:** Joi validation schemas and middleware  
**Lines:** ~120 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #4
```

---

### 13. [server/src/services/email.mjs](server/src/services/email.mjs)
**New file**  
**Content:** Nodemailer email service  
**Lines:** ~150 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #5
```

---

### 14. [server/src/middleware/admin.mjs](server/src/middleware/admin.mjs)
**New file**  
**Content:** Admin role check middleware  
**Lines:** ~30 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #6
```

---

### 15. [server/src/controllers/admin.mjs](server/src/controllers/admin.mjs)
**New file**  
**Content:** Admin controller with 6 methods  
**Lines:** ~200 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #6
```

---

### 16. [server/src/routes/admin.mjs](server/src/routes/admin.mjs)
**New file**  
**Content:** Admin API routes  
**Lines:** ~60 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #6
```

---

### 17. [server/src/routes/webhooks.mjs](server/src/routes/webhooks.mjs)
**New file**  
**Content:** Flutterwave webhook handler  
**Lines:** ~90 lines

```javascript
// Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #9
```

---

### 18. [backup.sh](backup.sh)
**New file**  
**Content:** Database backup script  
**Lines:** ~40 lines
**Executable:** `chmod +x backup.sh`

```bash
# Copy from IMPLEMENTATION_PLAN_11_ISSUES.md → ISSUE #8
```

---

### 19. [logs/.gitkeep](logs/.gitkeep)
**New file**  
**Content:** Empty file to create logs directory in git  
**Lines:** 0

```bash
# Create empty file so logs/ directory exists
touch logs/.gitkeep
```

---

### 20. [SYSTEM_CONTRACT.md](SYSTEM_CONTRACT.md)
**New file (already created)**  
**Content:** System architecture rules and contracts  
**Lines:** 400+

---

### 21. [IMPLEMENTATION_PLAN_11_ISSUES.md](IMPLEMENTATION_PLAN_11_ISSUES.md)
**New file (already created)**  
**Content:** Detailed implementation for all 11 issues  
**Lines:** 800+

---

### 22. [TWO_WEEK_ROADMAP.md](TWO_WEEK_ROADMAP.md)
**New file (already created)**  
**Content:** Day-by-day implementation schedule  
**Lines:** 600+

---

### 23. [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
**New file (already created)**  
**Content:** Quick checklist and commands  
**Lines:** 300+

---

## Frontend Files (from Figma Import)

### 24. [client/package.json](client/package.json) - CREATE
```json
{
  "name": "apeacademy-frontend",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-router-dom": "^6.20.0",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "4.2.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.3.0",
    "vite": "6.3.5"
  }
}
```

---

### 25. [client/vite.config.ts](client/vite.config.ts) - CREATE
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
  },
})
```

---

### 26. [client/tsconfig.json](client/tsconfig.json) - CREATE
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src"],
  "exclude": ["node_modules"]
}
```

---

### 27. [client/.env.example](client/.env.example) - CREATE
```env
VITE_API_URL=http://localhost:3000/api
```

---

### 28. [client/src/App.tsx](client/src/App.tsx)
- Move/copy from Figma import
- Update API calls to use real backend
- Update payment integration

---

### 29. [client/src/services/api.ts](client/src/services/api.ts) - CREATE
```typescript
// Copy from FRONTEND_IMPLEMENTATION_GUIDE.md
```

---

### 30. [client/src/pages/PaymentCallback.tsx](client/src/pages/PaymentCallback.tsx) - CREATE
```typescript
// Handle payment callback from Flutterwave
// Parse tx_ref from URL params
// Call GET /api/payments/verify/:tx_ref
```

---

## Summary: Files Needed

| Category | Count | Status |
|----------|-------|--------|
| Modify existing files | 10 | ~200 lines changes |
| Create new backend files | 8 | ~700 lines |
| Create new frontend files | 3 | ~50 lines |
| Move Figma files | 4+ | From your Figma import |
| Documentation | 4 | Already created |
| **TOTAL** | **29** | **~1000 lines** |

---

## Implementation Order

**Day 1: Environment**
- Update .env.example → .env
- npm install (all new packages)
- Create logs/.gitkeep
- Create/update config files

**Day 2-3: Utilities**
1. Create server/src/utils/logger.mjs
2. Create server/src/utils/validation.mjs
3. Update server/src/middleware/errorHandler.mjs

**Day 3: Middleware & Payments**
4. Add rate limiting to server/index.mjs
5. Update server/src/controllers/payment.mjs
6. Update server/src/routes/payment.mjs

**Day 4-5: Admin & Email**
7. Create server/src/middleware/admin.mjs
8. Create server/src/controllers/admin.mjs
9. Create server/src/routes/admin.mjs
10. Create server/src/services/email.mjs

**Day 5-6: Webhooks & Backups**
11. Create server/src/routes/webhooks.mjs
12. Create backup.sh

**Day 6-7: Database & Monitoring**
13. Update prisma/schema.prisma
14. Add Sentry to server/index.mjs
15. npm run db:migrate

**Day 7-8: Frontend Integration**
16. Create client/ folder structure
17. Create client/package.json
18. Create client/vite.config.ts
19. Create client/tsconfig.json
20. Copy/import Figma files to client/src/
21. Create API service: client/src/services/api.ts
22. Update frontend to use real API

---

## Line Count Summary

| Component | Lines | Status |
|-----------|-------|--------|
| logger.mjs | 70 | Copy |
| validation.mjs | 120 | Copy |
| email.mjs | 150 | Copy |
| admin.mjs | 30 | Copy |
| admin controller | 200 | Copy |
| admin routes | 60 | Copy |
| webhooks.mjs | 90 | Copy |
| payment updates | 150 | Copy |
| backup.sh | 40 | Copy |
| Documentation | 2000 | ✓ Done |
| Frontend | 300 | Integrate Figma |
| **TOTAL** | **~3200** | - |

---

## Time Breakdown

| Task | Time | Status |
|------|------|--------|
| Setup & environment | 2 hrs | Today |
| Logger & validation | 3 hrs | Day 2 |
| Rate limit & email | 3 hrs | Day 3 |
| Payment & admin | 4 hrs | Day 4 |
| Webhooks & backups | 3 hrs | Day 5 |
| Error tracking & DB | 2 hrs | Day 6 |
| Frontend integration | 4 hrs | Day 7-8 |
| Testing & polish | 4 hrs | Day 8 |
| Deployment prep | 2 hrs | Day 8 |
| **TOTAL** | **~27 hours** | - |

---

## Quick Verification

Before committing changes, verify:

```bash
# Syntax check
npm run build              # Should complete without errors

# Runtime check
npm run server:dev         # Should start without errors

# All routes exist
curl http://localhost:3000/api/health  # Should respond

# Logs exist
ls -la logs/               # Should see error.log, combined.log

# No hardcoded secrets
grep -r "FLUTTERWAVE" server/ | grep -v "config\|utils"
grep -r "JWT_SECRET" server/ | grep -v "config"
# Should return NOTHING (no hardcoded values)

# No console.log
grep -r "console\." server/ | grep -v "logger"
# Should return NOTHING
```

---

## Final Checklist

**All files created:**
- [ ] logger.mjs
- [ ] validation.mjs
- [ ] email.mjs
- [ ] admin.mjs
- [ ] admin controller
- [ ] admin routes
- [ ] webhooks.mjs
- [ ] backup.sh
- [ ] client/ folder with Figma integration

**All files updated:**
- [ ] server/index.mjs (rate limit, Sentry, webhooks, admin)
- [ ] server/src/controllers/payment.mjs (complete implementation)
- [ ] server/src/routes/payment.mjs (new routes)
- [ ] server/src/utils/flutterwave.mjs (better verification)
- [ ] server/src/middleware/errorHandler.mjs (logging)
- [ ] prisma/schema.prisma (user role field)
- [ ] package.json (new scripts)
- [ ] .env.example (new vars)

**Database:**
- [ ] Migration run: `npm run db:migrate`
- [ ] User role updated to "admin"

**Frontend:**
- [ ] client/package.json created
- [ ] client/vite.config.ts created
- [ ] Figma files integrated
- [ ] API service created
- [ ] Build succeeds: `npm run build` (from client/)

