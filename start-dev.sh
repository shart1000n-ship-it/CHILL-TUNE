#!/bin/bash

# 🚀 TRUE TALK - Development Startup Script
# "You got it goin' on!"

echo "🎬 TRUE TALK - Starting Development Environment..."
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js not found!${NC}"
    echo -e "${YELLOW}Please install Node.js 18+ and try again.${NC}"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version $(node -v) detected.${NC}"
    echo -e "${YELLOW}Recommended: Node.js 18+ for best performance.${NC}"
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "server/node_modules" ]; then
    echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
    cd server && npm install && cd ..
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${BLUE}🔧 Creating .env.local file...${NC}"
    cat > .env.local << EOF
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001
NODE_ENV=development

# Backend Environment Variables (optional)
PORT=3001
NODE_ENV=development
EOF
    echo -e "${GREEN}✅ .env.local created!${NC}"
fi

# Build frontend
echo -e "${BLUE}🔨 Building frontend...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend build failed! Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Frontend built successfully!${NC}"

# Start development servers
echo -e "${BLUE}🚀 Starting development servers...${NC}"
echo -e "${YELLOW}Frontend: http://localhost:5173${NC}"
echo -e "${YELLOW}Backend:  http://localhost:3001${NC}"
echo -e "${YELLOW}API:      http://localhost:3001/api/health${NC}"
echo ""

# Start both servers concurrently
npm run dev:full

echo ""
echo -e "${GREEN}🎬 TRUE TALK - Get Real! 🚀${NC}"
