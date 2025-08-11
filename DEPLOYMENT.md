# 🚀 Deployment Guide - Irene Companion AI

## 🔧 Fixed Vercel Configuration

The deployment error has been resolved! The new `vercel.json` configuration is optimized for modern React/Vite projects.

## 📋 Pre-Deployment Checklist

Before deploying, ensure you have:

✅ **Environment Variables Ready:**
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- `VITE_OPENAI_API_KEY` - Your OpenAI API key

✅ **Supabase Project Setup:**
- Database schema deployed (`supabase-schema.sql` + `supabase-social-schema.sql`)
- Authentication enabled (email + optional providers)
- Row Level Security (RLS) policies enabled

✅ **Local Build Test:**
```bash
npm run build  # Should complete without errors
```

## 🎯 Deployment Options

### 1. **Vercel (Recommended) - Fixed Configuration**

#### **Option A: GitHub Integration (Automatic)**
1. Go to [vercel.com](https://vercel.com)
2. "Import Git Repository" → Select `DavidLai82/CompanionAi`
3. **Framework Preset:** Vite
4. **Root Directory:** `./` (leave empty)
5. **Build Command:** Uses `npm run build` (automatic)
6. **Output Directory:** `dist` (automatic)
7. **Install Command:** `npm install --legacy-peer-deps`
8. Add environment variables in Vercel dashboard
9. Deploy! 🚀

#### **Option B: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project directory
vercel

# Follow prompts:
# - Link to existing project or create new
# - Framework: Other
# - Build Command: npm run build
# - Output Directory: dist
# - Dev Command: npm run dev

# Add environment variables
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add VITE_OPENAI_API_KEY

# Deploy to production
vercel --prod
```

### 2. **Netlify**

#### **Option A: Drag & Drop**
```bash
# Build locally
npm run build

# Drag the 'dist' folder to netlify.com
# Set environment variables in site settings
```

#### **Option B: Git Integration**
1. Connect GitHub repo at [netlify.com](https://netlify.com)
2. **Build Command:** `npm run build`
3. **Publish Directory:** `dist`
4. **Node Version:** 18 (in environment variables)
5. Add environment variables in site settings
6. Uses included `netlify.toml` configuration

### 3. **Other Static Hosting Platforms**

#### **GitHub Pages**
```bash
# Build project
npm run build

# Deploy dist folder to gh-pages branch
npm install -g gh-pages
gh-pages -d dist
```

#### **Firebase Hosting**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize Firebase
firebase init hosting
# Choose 'dist' as public directory
# Configure as single-page app: Yes

# Build and deploy
npm run build
firebase deploy
```

#### **Surge.sh**
```bash
# Install Surge
npm install -g surge

# Build and deploy
npm run build
cd dist
surge
```

## 🔧 Build Scripts Available

- **`build.sh`** - Vercel-optimized build script
- **`deploy.sh`** - Full deployment preparation with validation
- **`npm run build`** - Standard Vite production build

## 🐛 Troubleshooting Deployment Issues

### **Vercel Specific**
- ✅ **"Build src is index.html but expected package.json"** - Fixed with new `vercel.json`
- ✅ **Build settings warning** - Fixed by removing legacy `builds` configuration
- Use `build.sh` if automatic detection fails

### **Environment Variables**
```bash
# Test locally first
npm run dev
# Check browser console for API connection errors
```

### **Build Failures**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Test build locally
npm run build

# Check for TypeScript errors
npm run typecheck
```

### **Runtime Errors**
- **Supabase Connection:** Verify URL and key are correct
- **OpenAI API:** Check API key and billing status
- **CORS Issues:** Configure allowed origins in Supabase dashboard

## 🎉 Post-Deployment Steps

1. **Test Core Features:**
   - User registration/login
   - AI chat functionality
   - Profile creation
   - Matching system

2. **Configure Supabase:**
   - Set up email authentication
   - Deploy Edge Functions (optional)
   - Configure storage bucket for photos

3. **Monitor Performance:**
   - Check Vercel analytics
   - Monitor API usage (OpenAI, Supabase)
   - Set up error tracking

## 🌐 Production URLs

After deployment, your Irene Companion AI will be live at:
- **Vercel:** `https://your-project.vercel.app`
- **Netlify:** `https://your-site.netlify.app`
- **Custom Domain:** Configure in platform settings

## 🔄 Continuous Deployment

All platforms support automatic deployment on git push:
- Push to `main` branch triggers new deployment
- Environment variables persist across deployments
- Build cache speeds up subsequent deployments

---

**Need Help?** Check the build logs in your deployment platform's dashboard for specific error details.

🎯 **Your Irene Companion AI is now ready for production deployment!** 🚀