# Deployment Guide

## Quick Setup Instructions

### 1. Install Dependencies

```bash
cd irene-companion
npm install --legacy-peer-deps
```

### 2. Set Environment Variables

Create `.env` file:
```env
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
REACT_APP_OPENAI_API_KEY=your-openai-api-key
```

### 3. Setup Supabase Database

1. Go to https://supabase.com and create new project
2. In the SQL Editor, paste and run the contents of `supabase-schema.sql`
3. Verify tables are created: profiles, messages, love_stats, swahili_slang, conversation_sessions

### 4. Test Locally

```bash
npm run dev
```

Visit http://localhost:3000 and test:
- Sign up/login 
- Send messages to Irene
- Try voice input (needs HTTPS for production)
- Test PWA installation (Add to Home Screen)

### 5. Deploy to Production

**For Vercel:**
```bash
npm install -g vercel
vercel
# Follow prompts, add environment variables in Vercel dashboard
```

**For Netlify:**
```bash
npm run build
# Upload dist/ folder to Netlify or connect GitHub repo
```

### 6. Mobile App (Optional)

```bash
# Install Capacitor
npm run cap:init

# Add platforms
npm run cap:add:android
npm run cap:add:ios

# Build and open in IDE
npm run android  # Opens Android Studio
npm run ios      # Opens Xcode (macOS only)
```

## Required API Keys

1. **Supabase**: Free tier available at https://supabase.com
2. **OpenAI**: Requires paid API key from https://platform.openai.com

## Production Considerations

- Move OpenAI API calls to backend (currently client-side)
- Set up proper domain and SSL for voice features
- Configure push notifications for mobile
- Add error monitoring (Sentry, etc.)
- Optimize images and bundle sizes

The app is now ready for deployment! 🚀💕