# ApeAcademy - Production Backend Guide

## Overview

ApeAcademy is a full-stack assignment submission platform with:
- **Frontend**: React (Vite) with Tailwind CSS
- **Backend**: Node.js/Express with PostgreSQL + Prisma
- **Auth**: JWT-based with bcryptjs password hashing
- **Payments**: Flutterwave integration (production-ready)
- **File Storage**: Local disk (abstracted for Cloudinary upgrade)

---

## Prerequisites

### Required
- **Node.js** v18+ (LTS recommended)
- **PostgreSQL** v12+ (local or managed service)
- **npm** or **yarn**

### Optional
- **Docker** (for containerized deployment)
- **Cloudinary** account (for cloud file storage)
- **Flutterwave** account (for payment processing)

---

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd Premium\ Student\ Assignment\ Platform
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and update with real values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/apeacademy"
JWT_SECRET="your-min-32-character-secret-key-here"
FLUTTERWAVE_PUBLIC_KEY="your_public_key"
FLUTTERWAVE_SECRET_KEY="your_secret_key"
```

### 3. Setup PostgreSQL Database

#### Option A: Local PostgreSQL

```bash
# Create database
createdb apeacademy

# Or via psql
psql -U postgres -c "CREATE DATABASE apeacademy;"
```

#### Option B: Docker PostgreSQL

```bash
docker run --name apeacademy-db \
  -e POSTGRES_USER=apeacademy \
  -e POSTGRES_PASSWORD=apeacademy123 \
  -e POSTGRES_DB=apeacademy \
  -p 5432:5432 \
  postgres:15-alpine
```

### 4. Run Prisma Migrations

```bash
npm run db:migrate
```

This creates all required tables (users, assignments, payments).

### 5. Start Development Server

```bash
# Terminal 1: Frontend (Vite dev server with hot reload)
npm run dev
# Opens at http://localhost:5174

# Terminal 2: Backend API
npm run server:dev
# Runs at http://localhost:3000
```

### 6. Verify Setup

Visit in browser:
- **Frontend**: http://localhost:5174
- **API Health**: http://localhost:3000/api/health
- **Prisma Studio** (view DB): `npm run db:studio`

---

## API Documentation

### Authentication Endpoints

#### POST /api/auth/signup
Create a new user account.

**Request:**
```json
{
  "fullName": "Jane Doe",
  "email": "jane@example.com",
  "password": "SecurePass123!",
  "region": "West Africa",
  "country": "Nigeria",
  "educationLevel": "university",
  "departmentOrCourse": "Computer Science"
}
```

**Response (201):**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "cuid...",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "region": "West Africa",
    "country": "Nigeria",
    "educationLevel": "university"
  },
  "token": "eyJhbGc..."
}
```

#### POST /api/auth/login
Authenticate a user and return JWT token.

**Request:**
```json
{
  "email": "jane@example.com",
  "password": "SecurePass123!"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "user": { ... },
  "token": "eyJhbGc..."
}
```

#### GET /api/auth/me
Get current authenticated user profile.

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "user": {
    "id": "cuid...",
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "region": "West Africa",
    "country": "Nigeria",
    "educationLevel": "university",
    "createdAt": "2026-02-02T10:00:00Z"
  }
}
```

---

### Region Endpoints

#### GET /api/regions
List all available regions.

**Response (200):**
```json
{
  "regions": ["West Africa", "East Africa", "Southern Africa", "Central Africa", "North Africa"]
}
```

#### GET /api/regions/:region/countries
List countries in a specific region.

**Example:** `GET /api/regions/West%20Africa/countries`

**Response (200):**
```json
{
  "region": "West Africa",
  "countries": ["Nigeria", "Ghana", "Senegal", "Côte d'Ivoire", "Benin"]
}
```

---

### Payment Endpoints

#### POST /api/payments/initiate
Create a payment intent for assignment submission.

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: application/json
```

**Request:**
```json
{
  "amount": 5000,
  "currency": "NGN",
  "assignmentId": "assignment-id-or-null"
}
```

**Response (201):**
```json
{
  "message": "Payment intent created",
  "payment": {
    "id": "pay-cuid...",
    "transactionReference": "APE-user-id-timestamp-random",
    "amount": 5000,
    "currency": "NGN"
  },
  "checkoutUrl": "https://checkout.flutterwave.com/pay/FLWPUBK_TEST_..."
}
```

#### GET /api/payments/verify/:tx_ref
Verify a payment after Flutterwave redirect.

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Example:** `GET /api/payments/verify/APE-user-id-timestamp-random`

**Response (200 - if verified):**
```json
{
  "message": "Payment verified successfully",
  "payment": {
    "id": "pay-cuid...",
    "status": "successful",
    "amount": 5000,
    "currency": "NGN"
  }
}
```

**Response (402 - if failed):**
```json
{
  "error": {
    "message": "Payment verification failed: data mismatch",
    "statusCode": 402
  }
}
```

---

### Assignment Endpoints

#### POST /api/assignments/create
Submit an assignment (requires verified payment).

**Headers:**
```
Authorization: Bearer eyJhbGc...
Content-Type: multipart/form-data
```

**Request (FormData):**
```
subject: "Mathematics Homework"
description: "Chapter 5 exercises"
educationLevel: "university"
departmentOrCourse: "Computer Science"
deadline: "2026-03-02T23:59:00Z"
deliveryPlatform: "whatsapp"
paymentId: "pay-cuid..."
file: <binary PDF/DOCX file>
```

**Response (201):**
```json
{
  "message": "Assignment submitted successfully",
  "assignment": {
    "id": "assign-cuid...",
    "subject": "Mathematics Homework",
    "status": "pending",
    "deliveryPlatform": "whatsapp",
    "deadline": "2026-03-02T23:59:00Z",
    "createdAt": "2026-02-02T10:00:00Z"
  }
}
```

#### GET /api/assignments/my
Get all assignments submitted by the user.

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "assignments": [
    {
      "id": "assign-cuid...",
      "subject": "Mathematics Homework",
      "status": "pending",
      "deliveryPlatform": "whatsapp",
      "payment": {
        "id": "pay-cuid...",
        "amount": 5000,
        "currency": "NGN",
        "paymentStatus": "successful"
      },
      "createdAt": "2026-02-02T10:00:00Z"
    }
  ]
}
```

#### GET /api/assignments/:id
Get a specific assignment (user must own it).

**Headers:**
```
Authorization: Bearer eyJhbGc...
```

**Response (200):**
```json
{
  "assignment": { ... }
}
```

---

## Database Schema

### User
```sql
id (CUID, primary key)
fullName (string)
email (string, unique, indexed)
passwordHash (string, bcrypt)
region (string)
country (string)
educationLevel (string: "middle school" | "high school" | "university")
departmentOrCourse (string, optional)
createdAt (timestamp)
updatedAt (timestamp)
```

### Assignment
```sql
id (CUID, primary key)
userId (CUID, foreign key → User)
subject (string)
description (string)
educationLevel (string)
departmentOrCourse (string, optional)
deadline (timestamp)
fileUrl (string)
fileName (string, optional)
deliveryPlatform (string: "whatsapp" | "email" | "google_messages" | "imessage")
paymentId (CUID, foreign key → Payment, nullable, indexed)
status (string: "pending" | "in_progress" | "delivered", indexed)
createdAt (timestamp)
updatedAt (timestamp)
```

### Payment
```sql
id (CUID, primary key)
userId (CUID, foreign key → User)
assignmentId (CUID, foreign key → Assignment, nullable)
amount (float)
currency (string, default: "NGN")
transactionReference (string, unique, indexed)
flutterwaveTransactionId (string, optional, indexed)
paymentStatus (string: "pending" | "successful" | "failed", indexed)
createdAt (timestamp)
updatedAt (timestamp)
```

---

## Production Deployment

### Option 1: Docker (Recommended)

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "server/index.mjs"]
```

Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: apeacademy
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: apeacademy
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: .
    environment:
      DATABASE_URL: postgresql://apeacademy:${DB_PASSWORD}@postgres:5432/apeacademy
      JWT_SECRET: ${JWT_SECRET}
      FLUTTERWAVE_PUBLIC_KEY: ${FLUTTERWAVE_PUBLIC_KEY}
      FLUTTERWAVE_SECRET_KEY: ${FLUTTERWAVE_SECRET_KEY}
      NODE_ENV: production
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    command: sh -c "npm run db:migrate && node server/index.mjs"

volumes:
  postgres_data:
```

Deploy:
```bash
docker-compose up -d
```

### Option 2: Heroku

```bash
heroku create apeacademy-api
heroku addons:create heroku-postgresql:standard-0

# Set environment variables
heroku config:set JWT_SECRET="your-secret"
heroku config:set FLUTTERWAVE_PUBLIC_KEY="your-key"
heroku config:set FLUTTERWAVE_SECRET_KEY="your-secret"

# Deploy
git push heroku main

# Run migrations
heroku run npm run db:migrate
```

### Option 3: DigitalOcean App Platform

1. Connect GitHub repo
2. Create new app
3. Add PostgreSQL database
4. Set environment variables in dashboard
5. Deploy

---

## Security Checklist

- [ ] Set `JWT_SECRET` to a strong, random 32+ character string
- [ ] Use HTTPS in production (via reverse proxy like Nginx)
- [ ] Enable CORS for your frontend domain only
- [ ] Use environment variables for all secrets (never commit `.env`)
- [ ] Rotate JWT secret periodically
- [ ] Enable rate limiting on login/signup endpoints
- [ ] Validate all file uploads (type, size)
- [ ] Hash passwords with bcryptjs (already done)
- [ ] Verify all payments with Flutterwave API (no frontend trust)
- [ ] Use `helmet()` for HTTP security headers (already enabled)
- [ ] Keep dependencies updated: `npm audit fix`
- [ ] Monitor logs for suspicious activity
- [ ] Use database backups (automated in managed services)

---

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npm install
npm run db:generate
```

### "connect ECONNREFUSED 127.0.0.1:5432"
PostgreSQL is not running. Start the database:
```bash
# If local
brew services start postgresql

# If Docker
docker-compose up postgres
```

### "401 Unauthorized"
Token missing or invalid. Include in request header:
```
Authorization: Bearer <token>
```

### "Payment verification failed"
Ensure `FLUTTERWAVE_SECRET_KEY` is set correctly and matches your account.

---

## Performance Optimization

- **Database indexing**: Indexed on `userId`, `paymentStatus`, `status` for fast queries
- **File uploads**: Max 50MB with MIME type validation
- **Caching**: Add Redis for token blacklist (future enhancement)
- **CDN**: Serve frontend via Cloudflare or similar
- **Database connection pool**: Adjust `max_pool_size` in `DATABASE_URL` if needed

---

## Next Steps

1. **Implement Email Notifications**: Send assignment confirmations
2. **Add Admin Dashboard**: View all submissions, manage statuses
3. **Webhook Support**: Listen for Flutterwave webhooks for async verification
4. **SMS Notifications**: Integrate Twilio for delivery updates
5. **Payment Analytics**: Track revenue, conversion rates
6. **Rate Limiting**: Prevent abuse with redis-based limits
7. **Two-Factor Auth**: Add optional 2FA for accounts

---

## Support & Contact

For issues or questions, open a GitHub issue or contact: support@apeacademy.com

---

**Last Updated**: February 2, 2026
