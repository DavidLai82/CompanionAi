# 🚨 Vercel Deployment Troubleshooting

## Common Issues & Solutions

### ❌ **Blank/White Page**
**Cause**: Missing environment variables or build errors
**Solution**:
1. Check Vercel deployment logs for errors
2. Add environment variables (see below)
3. Redeploy after adding variables

### ❌ **"Loading..." Forever** 
**Cause**: Missing Supabase environment variables
**Solution**: App falls back to demo mode when env vars missing

### ❌ **Build Failures**
**Cause**: Dependency or TypeScript issues
**Solution**: Use our custom build settings

## 🔧 Vercel Configuration Steps

### Step 1: Environment Variables
In your Vercel project settings, add:

```bash
# Required Environment Variables
VITE_SUPABASE_URL=https://huygmirmyomhmhhqpwmk.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1eWdtaXJteW9taG1oaHFwd21rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3MjY2MzYsImV4cCI6MjA3MDMwMjYzNn0.RO0ZwuT7uWyZDHmC5VC4qIOr5v1oeacCeA1_owzo_YY

# Optional but recommended
VITE_OPENAI_API_KEY=your-openai-api-key-here
```

### Step 2: Build Settings
**Framework Preset**: Vite
**Build Command**: `npm run build` 
**Output Directory**: `dist`
**Install Command**: `npm install --legacy-peer-deps`

### Step 3: Force Redeploy
After adding environment variables:
1. Go to **Deployments** tab
2. Click **"Redeploy"** on latest deployment
3. Check **"Use existing Build Cache"** = OFF

## 🔍 Debugging Steps

### Check Build Logs
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the failed deployment  
3. View build logs for specific errors

### Test Locally First
```bash
# Build locally to test
npm run build
npm run preview
# Should work at http://localhost:4173
```

### Common Error Messages

**"Module not found"**
- Solution: Clear build cache, redeploy

**"Environment variable undefined"** 
- Solution: Add missing VITE_ environment variables

**"Failed to compile"**
- Solution: Check TypeScript errors in logs

## 🎯 Quick Fix Checklist

- [ ] Environment variables added in Vercel dashboard
- [ ] Variables start with `VITE_` prefix  
- [ ] Redeployed after adding variables
- [ ] Build logs show successful completion
- [ ] No TypeScript errors in logs

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Build Logs**: Project → Deployments → Click deployment  
- **Environment Variables**: Project → Settings → Environment Variables
- **Force Redeploy**: Deployments → Click deployment → Redeploy

---

**Still having issues?** Check the browser console for specific JavaScript errors when visiting your deployed site.