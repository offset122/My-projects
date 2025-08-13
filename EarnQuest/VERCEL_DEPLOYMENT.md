# 🚀 Deploy EarnQuest Web App to Vercel

This guide will help you deploy the EarnQuest web application to Vercel for free hosting.

## 📋 Prerequisites

1. **GitHub Account** (you already have this)
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
3. **EarnQuest Backend** - Already deployed on Railway

## 🌐 **Step 1: Deploy to Vercel**

### **Option A: One-Click Deploy (Recommended)**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/offset122/My-projects&project-name=earnquest-web&repository-name=earnquest-web&root-directory=EarnQuest/web)

1. Click the "Deploy with Vercel" button above
2. Connect your GitHub account to Vercel
3. Select your `My-projects` repository
4. Set **Root Directory** to: `EarnQuest/web`
5. Add environment variables (see Step 2)
6. Click "Deploy"

### **Option B: Manual Setup**

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click "New Project"
3. Import your `My-projects` repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `EarnQuest/web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

## 🔧 **Step 2: Environment Variables**

In Vercel dashboard, add these environment variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://earnquest-backend.railway.app/api
NEXT_PUBLIC_APP_NAME=EarnQuest
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## 🎯 **Step 3: Custom Domain (Optional)**

1. In Vercel dashboard: Settings → Domains
2. Add your custom domain (e.g., `earnquest.co.ke`)
3. Follow DNS configuration instructions
4. SSL certificate is automatically provided

## ✅ **Step 4: Verify Deployment**

Your web app will be available at:
- **Vercel URL**: `https://your-project-name.vercel.app`
- **Custom Domain**: `https://your-domain.com` (if configured)

Test these features:
- ✅ User registration and login
- ✅ Survey browsing
- ✅ Rewards tracking
- ✅ Withdrawal system
- ✅ Mobile responsiveness

## 🔄 **Automatic Deployments**

Vercel automatically deploys when you:
- Push to the `main` branch
- Merge pull requests
- Make changes to the `EarnQuest/web` directory

## 🚀 **Performance Optimizations**

Your Vercel deployment includes:
- ⚡ **Edge Network**: Global CDN for fast loading
- 🖼️ **Image Optimization**: Automatic image compression
- 📱 **Mobile Optimization**: Responsive design
- 🔒 **HTTPS**: Automatic SSL certificates
- 📊 **Analytics**: Built-in performance monitoring

## 🛠️ **Development Workflow**

1. **Local Development**:
   ```bash
   cd EarnQuest/web
   npm run dev
   ```

2. **Preview Deployments**: Every pull request gets a preview URL

3. **Production Deployment**: Push to main branch

## 📊 **Monitoring & Analytics**

### **Vercel Analytics**
- Real-time visitor data
- Performance metrics
- Core Web Vitals

### **Error Monitoring**
- Automatic error tracking
- Performance insights
- User experience metrics

## 🔧 **Troubleshooting**

### **Build Errors**
```bash
# Check build locally
cd EarnQuest/web
npm run build
```

### **API Connection Issues**
- Verify `NEXT_PUBLIC_API_BASE_URL` is correct
- Check Railway backend is running
- Test API endpoints manually

### **Environment Variables**
- Must start with `NEXT_PUBLIC_` for client-side access
- Redeploy after changing environment variables

## 💡 **Pro Tips**

1. **Branch Previews**: Create feature branches for testing
2. **Custom Domains**: Use your own domain for branding
3. **Performance**: Monitor Core Web Vitals in Vercel dashboard
4. **SEO**: Vercel automatically optimizes for search engines

## 🎉 **You're Live!**

Your EarnQuest web application is now:
- 🌐 **Accessible worldwide** via Vercel's global CDN
- 📱 **Mobile-optimized** for Kenyan users
- 🔄 **Auto-updating** with every code change
- 🔒 **Secure** with HTTPS and modern security headers
- ⚡ **Fast** with edge computing and caching

Users can now access EarnQuest from any device with a web browser! 🎊

---

**Need help?** Check the [Vercel documentation](https://vercel.com/docs) or create an issue in your repository.
