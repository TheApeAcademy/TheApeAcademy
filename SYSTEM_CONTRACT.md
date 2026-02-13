# 📋 ApeAcademy - System Contract & Production Specification

**Version:** 1.0  
**Date:** February 8, 2026  
**Status:** AUTHORITATIVE - All decisions locked, no deviation

---

## Part 1: Architecture Contract

### 1.1 Folder Ownership Rules

**RULE: Single Responsibility per Folder**

```
Premium Student Assignment Platform/
├── /client              ← FRONTEND ONLY (to be created)
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   ├── utils/
│   │   └── styles/
│   ├── public/
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── package.json (client dependencies ONLY)
│   └── index.html
│
├── /server              ← BACKEND ONLY
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── config/
│   ├── index.mjs
│   ├── package.json (server dependencies ONLY)
│   └── uploads/
│
├── /prisma             ← DATABASE SCHEMA (shared)
│   └── schema.prisma
│
├── .env                ← Environment (NOT in git)
├── .env.example        ← Template (in git)
├── .gitignore
└── package.json        ← ROOT workspace package.json
```

**Critical Rules:**
- ❌ No `/client` imports from `/server`
- ❌ No `/server` imports from `/client`
- ❌ No frontend code in backend folder
- ❌ No backend code in frontend folder
- ✅ Both import from `/prisma` (database types only)
- ✅ Each has own `package.json` and `node_modules`

### 1.2 No Shared Runtime Files

```javascript
// ❌ FORBIDDEN
// client/src/utils/api.ts
import { config } from '../../server/src/config'  // NO!

// ✅ CORRECT
// client/src/utils/api.ts
const API_URL = import.meta.env.VITE_API_URL  // Use env only
```

---

## Part 2: Package & Dependency Discipline

### 2.1 Single Package Manager Rule

**RULE: npm ONLY - No yarn, pnpm, or mixing**

```bash
# ✅ ALLOWED
npm install
npm run dev
npm run build

# ❌ FORBIDDEN
yarn install          # NO - violates single manager rule
pnpm install          # NO - violates single manager rule
npm install && yarn add // NO - mixing managers
```

**Why:** Consistency, predictability, lock file integrity

### 2.2 No Global Installs Required

```bash
# ❌ This should NEVER be needed
npm install -g vite
npm install -g nodemon
npm install -g prisma

# ✅ Everything comes from node_modules/.bin
npx vite
npx nodemon
npx prisma
```

All binaries must be in `devDependencies` or `dependencies`.

### 2.3 Script Authority

**RULE: Every script command must exist in dependencies**

```json
{
  "scripts": {
    "dev": "vite",              // vite MUST be in devDependencies
    "build": "vite build",      // vite MUST be in devDependencies
    "server:dev": "nodemon server/index.mjs",  // nodemon MUST exist
    "db:migrate": "prisma migrate dev"         // prisma MUST exist
  },
  "devDependencies": {
    "vite": "^6.0.0",           // ✅ vite is here
    "nodemon": "^3.0.0",        // ✅ nodemon is here
    "prisma": "^5.0.0"          // ✅ prisma is here
  }
}
```

**Validation:** Before committing, run:
```bash
npm run <script-name>  # Must work without global installs
```

### 2.4 Lock File Authority

**RULE: package-lock.json is the source of truth**

```bash
# ✅ CORRECT WORKFLOW
# 1. Only modify package.json
npm install                    # Generates/updates package-lock.json
git add package.json package-lock.json
git commit

# ❌ NEVER DO THIS
rm -rf package-lock.json      # Only acceptable if irrevocably broken
npm install                    # Then regenerate

# ❌ FORBIDDEN
# Manually editing package-lock.json
# Using different npm versions than team
```

**Why:** Ensures everyone gets exact same versions

### 2.5 Node Modules Responsibility

**RULE: node_modules is generated, never committed**

```
.gitignore:
node_modules/
dist/
```

**Setup New Environment:**
```bash
git clone <repo>
npm install              # Generates node_modules from lock file
npm run build
npm run server:dev
```

---

## Part 3: Port Ownership Policy

### 3.1 Port Assignment (Fixed, No Negotiation)

```env
# .env
# FRONTEND
VITE_PORT=5174           # React dev server (Vite default)

# BACKEND
PORT=3000                # Node.js API

# DATABASE
DB_PORT=5432             # PostgreSQL (if local)
```

**Rule: One service per port, never share**

| Service | Port | Reason |
|---------|------|--------|
| Frontend (Vite) | 5174 | Development hot reload |
| API (Node/Express) | 3000 | Production standard |
| Database (PostgreSQL) | 5432 | Standard Postgres |

### 3.2 Port Binding in Code

**Backend (server/index.mjs):**
```javascript
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});
```

**Frontend (vite.config.ts):**
```typescript
export default defineConfig({
  server: {
    port: parseInt(process.env.VITE_PORT || '5174'),
  },
});
```

### 3.3 Startup Order (Critical)

**RULE: Backend FIRST, then Frontend**

```bash
# Terminal 1: Start API
npm run server:dev
# Waits for: PORT configured, DATABASE connected

# Terminal 2: Start Frontend
npm run dev
# Waits for: API_BASE_URL available at PORT
```

**Why:** Frontend depends on API, not vice versa. Never reverse.

---

## Part 4: Health & Sanity Checks

### 4.1 API Health Endpoint (No Auth Required)

```javascript
// server/index.mjs
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: prisma ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});
```

**Usage (test immediately on startup):**
```bash
curl http://localhost:3000/api/health
# Must respond within 3 seconds
```

### 4.2 Database Connection Test

**On Server Startup:**
```javascript
// server/index.mjs
async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✓ Database connected');
  } catch (error) {
    logger.error('✗ Database connection failed');
    process.exit(1);  // FAIL FAST
  }
}

await checkDatabase();
app.listen(PORT, () => {
  logger.info(`Server started on port ${PORT}`);
});
```

### 4.3 Environment Variable Validation

**Fail Fast If Missing Critical Vars:**

```javascript
// server/src/config/index.mjs
const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'NODE_ENV',
  'PORT',
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  console.error(`❌ Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

export const config = {
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  // ... rest of config
};
```

### 4.4 Startup Checklist (Log on Boot)

```
Server Startup Log:
✓ Environment loaded
✓ Node version: v20.10.0
✓ Database connected (apeacademy_db)
✓ JWT secret configured
✓ Prisma client initialized
✓ 4 routes registered
✓ Health endpoint active
✓ Error handler active
→ Server running on port 3000
```

---

## Part 5: Exact Startup Order

### 5.1 Development Startup (Two Terminals)

**Terminal 1 - Backend:**
```bash
npm run server:dev

# Output:
# 2026-02-08T10:30:00Z [info] Loading environment
# 2026-02-08T10:30:01Z [info] Database connected
# 2026-02-08T10:30:02Z [info] Server running on :3000
# 2026-02-08T10:30:02Z [info] Health endpoint: GET /api/health
```

**Terminal 2 - Frontend (After backend is ready):**
```bash
npm run dev

# Output:
# Local:   http://localhost:5174/
# Press q to quit
# Connecting to API at http://localhost:3000/api
```

### 5.2 Production Startup (Docker Compose)

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    # Starts first, waits for healthcheck
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U apeacademy"]
      interval: 5s
      timeout: 5s
      retries: 5

  api:
    # Starts after postgres is healthy
    depends_on:
      postgres:
        condition: service_healthy
    # Runs on port 3000

  # No separate frontend container - served by API
  # See: server/index.mjs static file serving
```

**Startup flow:**
```
1. PostgreSQL starts (5-10 seconds)
2. API connects to DB (2-3 seconds)
3. API listens on :3000 (1 second)
4. Frontend built into dist/ is served as static files
5. All endpoints live at localhost:3000 or https://domain.com
```

---

## Part 6: Production Environment Requirements

### 6.1 Environment Variables (Must Have)

**Critical Vars (app won't start without):**
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/apeacademy

# JWT Security
JWT_SECRET=<32+ character random string>
JWT_EXPIRY=7d

# Flutterwave Payments
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_LIVE_xxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK_LIVE_xxxxx
FLUTTERWAVE_ENCRYPTION_KEY=FLWENC_xxxxx

# Server
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourdomain.com

# Frontend
VITE_API_URL=https://api.yourdomain.com/api
```

**Optional Vars:**
```env
# Email Service
EMAIL_PROVIDER=sendgrid  # or gmail, mailgun, etc.
EMAIL_API_KEY=sg_xxxx
EMAIL_FROM=noreply@apeacademy.com

# File Storage
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx

# Monitoring
SENTRY_DSN=https://xxx

# Logging
LOG_LEVEL=info
```

### 6.2 Secrets Management Rules

**RULE: Never commit secrets**

```
.gitignore (must contain):
.env                  # ← Local secrets
.env.production       # ← Production secrets (if local)
.env.*.local

# But DO commit:
.env.example          # ← Template with empty values
```

**On Deployment:**
```bash
# Do NOT push .env to repo
# Instead, set environment variables on:
# - Railway: Project Settings → Environment
# - Heroku: heroku config:set VAR=value
# - Docker: Pass via -e or docker-compose.yml
# - AWS: Secrets Manager or Parameter Store
```

---

## Part 7: GitHub & Git Workflow

### 7.1 Commits Must Include Lock File

```bash
# ✅ CORRECT
git add package.json package-lock.json src/...
git commit -m "feat: add payment webhook"

# ❌ WRONG
git add package.json src/...
# Missing package-lock.json!
```

### 7.2 Merge Discipline

Before merging PRs with dependency changes:
```bash
npm install              # Regenerate node_modules
npm run build            # Verify build works
npm run server:dev       # Verify API starts
npm run dev              # Verify frontend starts
```

### 7.3 Deployment from Git

```bash
git clone https://github.com/user/apeacademy
cd apeacademy
npm install              # Reads from package-lock.json
npm run build            # Frontend: creates dist/
npm run server:prod      # Backend: starts API with frontend
```

---

## Part 8: Success Criteria (Must ALL Pass)

- [ ] Single `npm` manager used
- [ ] No global installs needed (all from node_modules)
- [ ] `package-lock.json` is authoritative
- [ ] Backend starts: `npm run server:dev` → 3000 ready in 5 sec
- [ ] Frontend starts: `npm run dev` → 5174 ready, connects to API
- [ ] `GET /api/health` responds without auth
- [ ] Database connection verified on startup
- [ ] All env vars checked at startup, app exits if missing
- [ ] Port conflicts impossible (fixed ports)
- [ ] Production build: `npm run build && npm start` works
- [ ] Zero code imports across /client and /server
- [ ] Docker Compose brings up complete stack with one command
- [ ] GitHub lockfile is always in sync with package.json

---

## Part 9: Development Workflow for Team

### Developer Onboarding (30 minutes)

```bash
# 1. Clone
git clone https://github.com/your-org/apeacademy
cd apeacademy

# 2. Install
npm install                    # Creates node_modules from package-lock.json

# 3. Setup
cp .env.example .env
# Edit .env with local database URL and keys

# 4. Database
npm run db:migrate            # Create tables

# 5. Run (two terminals)
# Terminal 1:
npm run server:dev            # Backend on :3000

# Terminal 2:
npm run dev                   # Frontend on :5174

# 6. Test
curl http://localhost:3000/api/health   # Should respond
# Visit http://localhost:5174 in browser
```

### Making Changes

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes in /client or /server (never both imports)
# Edit src files OR server/src files, not both

# 3. If adding dependencies:
npm install new-package-name  # Updates package-lock.json

# 4. Commit (always include lock file)
git add .
git commit -m "feat: description"

# 5. Push
git push origin feature/my-feature

# 6. PR review checks:
# - No circular imports?
# - package-lock.json included?
# - Tests pass?
# - Builds successfully?
```

---

## Part 10: Deployment Checklist

### Before Every Production Deploy

- [ ] All env vars set in deployment platform
- [ ] Database backup created
- [ ] Code built successfully: `npm run build`
- [ ] No security keys in code or GitHub
- [ ] `package-lock.json` matches dependencies
- [ ] Health endpoint responds
- [ ] Database migrations run: `npm run db:migrate`
- [ ] No circular imports or cross-folder imports
- [ ] Flutterwave keys are LIVE (not TEST)
- [ ] JWT_SECRET is production-grade (32+ chars)
- [ ] All rate limiting active
- [ ] HTTPS enabled
- [ ] Error tracking (Sentry) configured
- [ ] Logs going to persistent storage
- [ ] Backups scheduled and tested

---

## Summary: The Contract

| Aspect | Rule | Why |
|--------|------|-----|
| **Folders** | `/client` ⊥ `/server` | No coupling |
| **Packages** | npm only, lock file sacred | Reproducibility |
| **Ports** | Fixed (5174, 3000) | No conflicts |
| **Startup** | Backend first, then frontend | Dependency order |
| **Health** | Must verify DB and env at boot | Fail fast |
| **Secrets** | Never in git, only .env.example | Security |
| **Lock file** | Always committed with package.json | Team sync |

**This contract is binding. All code follows these rules.**

