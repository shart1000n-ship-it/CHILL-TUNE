#!/bin/bash

# 🚀 TRUE TALK - Vercel Deployment Script
# "You got it goin' on!"

echo "🎬 TRUE TALK - Deploying to Vercel..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not found!${NC}"
    echo -e "${YELLOW}Installing Vercel CLI...${NC}"
    npm install -g vercel
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️  .env.local not found!${NC}"
    echo -e "${BLUE}Creating .env.local template...${NC}"
    cat > .env.local << EOF
# Firebase Configuration
VITE_FB_API_KEY=your-api-key-here
VITE_FB_AUTH_DOMAIN=prj_1QkT21Q8hwEMekZ4wTwU8jrJXUWW.firebaseapp.com
VITE_FB_DB_URL=https://prj_1QkT21Q8hwEMekZ4wTwU8jrJXUWW-default-rtdb.firebaseio.com
VITE_FB_PROJECT_ID=prj_1QkT21Q8hwEMekZ4wTwU8jrJXUWW
VITE_FB_STORAGE=prj_1QkT21Q8hwEMekZ4wTwU8jrJXUWW.appspot.com
VITE_FB_SENDER_ID=your-sender-id-here
VITE_FB_APP_ID=your-app-id-here
EOF
    echo -e "${YELLOW}⚠️  Please update .env.local with your Firebase credentials before deploying!${NC}"
    exit 1
fi

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm install

# Build the project
echo -e "${BLUE}🔨 Building project...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Please fix the errors and try again.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build successful!${NC}"

# Deploy to Vercel
echo -e "${BLUE}🚀 Deploying to Vercel...${NC}"
echo -e "${YELLOW}This will open your browser for authentication if needed.${NC}"

vercel --prod

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${BLUE}Your TRUE TALK app is now live on Vercel!${NC}"
    echo -e "${YELLOW}Don't forget to:${NC}"
    echo -e "  • Set environment variables in Vercel dashboard"
    echo -e "  • Configure custom domain (optional)"
    echo -e "  • Test video calling functionality"
    echo -e "  • Check mobile responsiveness"
else
    echo -e "${RED}❌ Deployment failed!${NC}"
    echo -e "${YELLOW}Check the error messages above and try again.${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎬 TRUE TALK - Get Real! 🚀${NC}"
