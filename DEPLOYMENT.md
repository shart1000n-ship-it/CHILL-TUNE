# 🚀 Deployment Guide - CHILL & TUNE Radio App

## 📋 Prerequisites
- GitHub repository: `https://github.com/shart1000n-ship-it/CHILL-TUNE.git`
- Node.js 22.x installed
- npm or yarn package manager

## 🔧 Setup Instructions

### 1. GitHub Repository Setup
Your repository is already configured at: `https://github.com/shart1000n-ship-it/CHILL-TUNE.git`

### 2. Automatic Deployment with GitHub Actions

#### Option A: Deploy to Netlify
1. Go to [Netlify](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect your GitHub account
4. Select the `CHILL-TUNE` repository
5. Set build command: `npm run build`
6. Set publish directory: `.next`
7. Click "Deploy site"

#### Option B: Deploy to Vercel
1. Go to [Vercel](https://vercel.com) and sign up/login
2. Click "New Project"
3. Import your GitHub repository: `shart1000n-ship-it/CHILL-TUNE`
4. Vercel will auto-detect Next.js settings
5. Click "Deploy"

### 3. Environment Variables Setup

#### For Netlify:
Add these environment variables in your Netlify dashboard:
```
NODE_VERSION=22
NODE_ENV=production
```

#### For Vercel:
Add these environment variables in your Vercel dashboard:
```
NODE_ENV=production
```

### 4. Custom Domain (Optional)
- **Netlify**: Go to Domain settings → Add custom domain
- **Vercel**: Go to Settings → Domains → Add domain

## 🚀 Manual Deployment

### Build Locally
```bash
npm install
npm run build
npm start
```

### Deploy Commands
```bash
# For Netlify
npm run build
# Upload .next folder to Netlify

# For Vercel
npm run vercel-build
vercel --prod
```

## 📱 Features Deployed
✅ Live Radio Streaming  
✅ DJ Console with Exclusive Tracks  
✅ Live Audio/Video Broadcasting  
✅ Podcast Management  
✅ Song Requests  
✅ Live Chat  
✅ Crossfader Controls  
✅ Support Links (Cash App & PayPal)  

## 🔍 Troubleshooting

### Build Errors
- Ensure Node.js 22.x is installed
- Clear npm cache: `npm cache clean --force`
- Delete node_modules and reinstall: `rm -rf node_modules && npm install`

### Deployment Issues
- Check GitHub Actions logs for errors
- Verify environment variables are set
- Ensure build command works locally

### Runtime Errors
- Check browser console for JavaScript errors
- Verify Supabase credentials in production
- Check API endpoint accessibility

## 📞 Support
- **GitHub Issues**: Create issue in repository
- **Admin Access**: Use password `admin123` on radio page
- **Live Demo**: Visit deployed URL

## 🔄 Continuous Deployment
Every push to the `main` branch will automatically trigger deployment!

---
**Last Updated**: December 2024
**Last Deployed**: December 2024
**Version**: 1.0.0
**Maintainer**: @SheridanHart932
**Live URL**: https://chilltuneradio.netlify.app
