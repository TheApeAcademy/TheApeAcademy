#!/bin/bash

# ApeAcademy - Quick Setup Script
# Run this to set up development environment

set -e

echo "🦍 ApeAcademy - Quick Setup"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${BLUE}Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}❌ Node.js not found. Install from https://nodejs.org${NC}"
    exit 1
fi
NODE_VERSION=$(node -v)
echo -e "${GREEN}✓ Node.js ${NODE_VERSION}${NC}"

# Check PostgreSQL
echo -e "${BLUE}Checking PostgreSQL...${NC}"
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️ PostgreSQL not found. You can:${NC}"
    echo -e "   - Install locally: brew install postgresql (macOS) or apt install postgresql (Linux)"
    echo -e "   - Use Docker: docker run -e POSTGRES_PASSWORD=apeacademy123 -p 5432:5432 postgres:15-alpine"
    echo ""
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
npm install --legacy-peer-deps --no-audit --no-fund
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Setup environment
echo -e "${BLUE}Setting up environment...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✓ Created .env file${NC}"
    echo -e "${YELLOW}⚠️  Update .env with your database URL and API keys${NC}"
else
    echo -e "${GREEN}✓ .env already exists${NC}"
fi

# Prisma setup
echo -e "${BLUE}Setting up database...${NC}"
npm run db:generate
echo -e "${GREEN}✓ Prisma client generated${NC}"

# Check if database is accessible
echo -e "${BLUE}Checking database connection...${NC}"
if npm run db:migrate 2>/dev/null; then
    echo -e "${GREEN}✓ Database migrations applied${NC}"
else
    echo -e "${YELLOW}⚠️  Database migration skipped (check your .env DATABASE_URL)${NC}"
fi

# Summary
echo ""
echo -e "${GREEN}=============================="
echo "✅ Setup Complete!"
echo "==============================${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo ""
echo "1. Edit .env with your configuration:"
echo "   DATABASE_URL (PostgreSQL connection)"
echo "   JWT_SECRET (min 32 characters)"
echo "   FLUTTERWAVE_PUBLIC_KEY and FLUTTERWAVE_SECRET_KEY"
echo ""
echo "2. Start development (in separate terminals):"
echo ""
echo -e "   ${YELLOW}Terminal 1 - Frontend:${NC}"
echo "   npm run dev"
echo "   → Opens at http://localhost:5174"
echo ""
echo -e "   ${YELLOW}Terminal 2 - Backend:${NC}"
echo "   npm run server:dev"
echo "   → API at http://localhost:3000"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:3000/api/health"
echo ""
echo "4. View database:"
echo "   npm run db:studio"
echo ""
echo -e "${BLUE}Documentation:${NC}"
echo "- API Docs: BACKEND.md"
echo "- Deployment: DEPLOYMENT.md"
echo "- Summary: PRODUCTION_SUMMARY.md"
echo ""
