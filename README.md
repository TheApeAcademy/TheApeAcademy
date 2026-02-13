
  # ApeAcademy - Premium Student Assignment Platform

> A production-ready full-stack platform for students to submit assignments and pay for solutions via WhatsApp, Email, Google Messages, or iMessage.

## 🎯 Overview

ApeAcademy is a complete web application with:

- **Frontend**: Modern React app with Vite and Tailwind CSS (auto-deployed)
- **Backend**: Production-grade Node.js/Express API with PostgreSQL
- **Auth**: Secure JWT-based authentication with bcryptjs
- **Payments**: Flutterwave integration for real transactions
- **File Uploads**: Secure upload with Cloudinary-ready abstraction
- **Deployment**: Docker, Heroku, Railway, DigitalOcean, or VPS ready

**Status**: ✅ Production Ready | **License**: MIT

---

## 🚀 Quick Start

### 30 Seconds - Local Development

```bash
# Clone and setup
git clone <repo>
cd Premium\ Student\ Assignment\ Platform
bash setup.sh          # Auto-configures everything

# Start in two terminals
npm run dev            # Frontend at http://localhost:5174
npm run server:dev     # API at http://localhost:3000
```

### 2 Minutes - Docker Deployment

```bash
# Start everything with one command
docker-compose up -d

# Run migrations
docker-compose exec api npm run db:migrate

# Access at http://localhost:3000
```

---

## 📋 Key Features

### For Students
- ✅ Region/country selection
- ✅ Browse available assignments
- ✅ Secure authentication (signup/login)
- ✅ Submit assignments with file upload
- ✅ **Pay first, then submit** workflow
- ✅ Choose delivery method (WhatsApp, Email, etc.)
- ✅ Track submission status

### For Backend
- ✅ User authentication with JWT
- ✅ Role-based access control (ready to extend)
- ✅ Payment processing with Flutterwave
- ✅ Secure file uploads (PDF, DOCX, images)
- ✅ Real-time payment verification
- ✅ Comprehensive error handling
- ✅ Production logging and monitoring ready

### For Deployment
- ✅ Docker & Docker Compose
- ✅ Multiple cloud providers supported
- ✅ Environment-based configuration
- ✅ Database migrations automated
- ✅ Health checks included
- ✅ Graceful shutdown support

---

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| **[BACKEND.md](./BACKEND.md)** | Complete API documentation with curl examples |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Deployment guides for 5+ platforms |
| **[PRODUCTION_SUMMARY.md](./PRODUCTION_SUMMARY.md)** | Technical summary and architecture |

---

## 💻 Installation

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (or Docker)
- Git

### Setup

```bash
# Clone and enter directory
git clone <repo>
cd Premium\ Student\ Assignment\ Platform

# Run setup script (automated)
bash setup.sh

# Or manual setup
npm install --legacy-peer-deps
cp .env.example .env
# Edit .env with your database and API keys
npm run db:migrate
```

### Start Development

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run server:dev
```

Visit:
- Frontend: http://localhost:5174
- API: http://localhost:3000
- Health check: http://localhost:3000/api/health

---

## 🐳 Docker Deployment

```bash
# Start services
docker-compose up -d

# Apply database schema
docker-compose exec api npm run db:migrate

# View logs
docker-compose logs -f api

# Access at http://localhost:3000
```

---

## 📖 API Quick Reference

### Authentication
```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePass123!",
    "region": "West Africa",
    "country": "Nigeria",
    "educationLevel": "university"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "jane@example.com", "password": "SecurePass123!"}'

# Get current user
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/auth/me
```

### Regions
```bash
# List regions
curl http://localhost:3000/api/regions

# Get countries in region
curl "http://localhost:3000/api/regions/West%20Africa/countries"
```

### Payments
```bash
# Initiate payment
curl -X POST http://localhost:3000/api/payments/initiate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"amount": 5000, "currency": "NGN"}'

# Verify payment
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/payments/verify/<tx_ref>
```

### Assignments
```bash
# Submit assignment (multipart/form-data with file)
curl -X POST http://localhost:3000/api/assignments/create \
  -H "Authorization: Bearer <token>" \
  -F "subject=Math Homework" \
  -F "description=Chapter 5 exercises" \
  -F "educationLevel=university" \
  -F "deliveryPlatform=whatsapp" \
  -F "paymentId=<payment-id>" \
  -F "file=@assignment.pdf"

# Get user assignments
curl -H "Authorization: Bearer <token>" \
  http://localhost:3000/api/assignments/my
```

**[See BACKEND.md for complete documentation](./BACKEND.md)**

---

## 🏗️ Architecture

```
Frontend (React + Vite)
├── Landing page
├── Region/country selection
├── Home page (assignment list)
├── Submit assignment form
└── Payment & success page

     ↓ (API calls)

Backend (Node.js + Express)
├── Authentication (JWT + bcryptjs)
├── User management
├── Region/country data
├── Payment processing (Flutterwave)
├── Assignment handling
└── File upload service

     ↓ (SQL queries)

Database (PostgreSQL)
├── Users
├── Assignments
└── Payments
```

---

## 🔐 Security

- ✅ Passwords hashed with bcryptjs (10 rounds)
- ✅ JWT tokens for stateless authentication
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Input validation on all endpoints
- ✅ File upload validation (type & size)
- ✅ Server-side payment verification (Flutterwave API)
- ✅ SQL injection prevention (Prisma ORM)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT, bcryptjs |
| File Storage | Local + Cloudinary ready |
| Payments | Flutterwave API |
| Deployment | Docker, Docker Compose |

---

## 📊 Useful Commands

```bash
# Development
npm run dev              # Frontend dev server
npm run server:dev       # Backend dev server
npm run build            # Build frontend

# Database
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations
npm run db:studio       # Open database UI

# Docker
docker-compose up -d    # Start services
docker-compose down     # Stop services
docker-compose logs -f  # View logs
```

---

## 🚀 Deployment

### Quick Deploy to Railway
1. Push code to GitHub
2. Connect to Railway.app
3. Add PostgreSQL
4. Set environment variables
5. Deploy

[See DEPLOYMENT.md for detailed guides on 5+ platforms](./DEPLOYMENT.md)

---

## 📋 Production Checklist

- [ ] Set strong `JWT_SECRET` (32+ characters)
- [ ] Configure Flutterwave keys
- [ ] Use managed PostgreSQL
- [ ] Enable HTTPS
- [ ] Configure domain in environment
- [ ] Setup database backups
- [ ] Run security audit (`npm audit`)
- [ ] Test payment flow end-to-end

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📞 Support

- 📖 [Backend Documentation](./BACKEND.md)
- 🚀 [Deployment Guide](./DEPLOYMENT.md)
- 📊 [Technical Summary](./PRODUCTION_SUMMARY.md)
- 🐛 GitHub Issues

---

## 📝 License

MIT License - see LICENSE file for details.

---

**ApeAcademy** - Where Education Meets Technology

Built with ❤️ using modern web technologies | Last Updated: February 2, 2026
  