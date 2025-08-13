# 🚀 EarnQuest Deployment Guide

This guide will help you deploy EarnQuest to production using Railway for the backend API.

## 📋 Prerequisites

1. **GitHub Account** (you already have this)
2. **Railway Account** - Sign up at [railway.app](https://railway.app)
3. **API Keys** - CPX Research, M-PESA, PayPal credentials

## 🛤️ Railway Backend Deployment

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `My-projects` repository
4. Choose "Deploy from a folder" → `EarnQuest/backend`

### Step 2: Configure Environment Variables

In your Railway dashboard, go to Variables tab and add:

```env
FLASK_ENV=production
SECRET_KEY=your-super-secret-production-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here

# CPX Research (get from CPX Research dashboard)
CPX_RESEARCH_API_KEY=your-api-key
CPX_RESEARCH_APP_ID=your-app-id

# M-PESA (get from Safaricom Developer Portal)
MPESA_CONSUMER_KEY=your-consumer-key
MPESA_CONSUMER_SECRET=your-consumer-secret
MPESA_SHORTCODE=your-shortcode
MPESA_PASSKEY=your-passkey
MPESA_ENVIRONMENT=production

# PayPal (get from PayPal Developer Dashboard)
PAYPAL_CLIENT_ID=your-client-id
PAYPAL_CLIENT_SECRET=your-client-secret
PAYPAL_ENVIRONMENT=live
```

### Step 3: Add PostgreSQL Database

1. In Railway dashboard, click "New" → "Database" → "PostgreSQL"
2. Railway will automatically set the `DATABASE_URL` environment variable

### Step 4: Deploy

1. Railway will automatically deploy when you push to main branch
2. Your API will be available at: `https://your-app-name.railway.app`

## 📱 Mobile App Configuration

### Update API Endpoint

1. Create `EarnQuest/mobile/.env` file:
```env
API_BASE_URL=https://your-app-name.railway.app/api
API_TIMEOUT=10000
```

2. For development with physical devices, use your Railway URL instead of localhost

### Build Android APK

```bash
cd EarnQuest/mobile

# Install dependencies
npm install

# Generate release APK
cd android
./gradlew assembleRelease

# APK will be in: android/app/build/outputs/apk/release/app-release.apk
```

## 🔧 GitHub Actions Setup

### Add Railway Token to GitHub Secrets

1. Get Railway token: `railway login` → `railway whoami --token`
2. In GitHub repo: Settings → Secrets → Actions → New repository secret
3. Name: `RAILWAY_TOKEN`, Value: your token

### Automatic Deployments

- Every push to `main` branch will trigger deployment
- GitHub Actions will run tests and deploy to Railway
- Check Actions tab for deployment status

## 🌐 Custom Domain (Optional)

1. In Railway dashboard: Settings → Domains
2. Add your custom domain (e.g., `api.earnquest.co.ke`)
3. Update mobile app `.env` with new domain

## 📊 Monitoring

### Railway Dashboard
- View logs, metrics, and deployments
- Monitor database usage and performance
- Set up alerts for downtime

### Health Check
Your API includes a health endpoint: `GET /api/health`

## 🔒 Security Checklist

- ✅ Use strong SECRET_KEY and JWT_SECRET_KEY
- ✅ Set FLASK_ENV=production
- ✅ Configure CORS_ORIGINS for your domains
- ✅ Use HTTPS only in production
- ✅ Keep API keys secure in Railway environment variables

## 🚀 Going Live

1. **Test thoroughly** with Railway staging environment
2. **Configure real API keys** (CPX Research, M-PESA, PayPal)
3. **Build and test mobile app** with production API
4. **Set up monitoring** and error tracking
5. **Deploy to app stores** (Google Play, Apple App Store)

## 💡 Tips

- Use Railway's preview deployments for testing
- Monitor your database usage (Railway free tier has limits)
- Set up error tracking (Sentry, Rollbar)
- Use Railway's built-in metrics for performance monitoring

Your EarnQuest app is now ready for production! 🎉
