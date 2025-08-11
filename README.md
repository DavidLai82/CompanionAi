# 💕 Irene Companion AI - Social Matching Platform

A complete AI-powered social matching platform with romantic AI companion, personality-based matching, and comprehensive dating features.

## 🌟 Features

### 💬 **AI Companion Chat**
- Romantic, flirty AI personality powered by OpenAI GPT-4o-mini
- Voice chat with speech-to-text and text-to-speech
- Emotion-based avatar reactions (blush, wink, smile, laugh)
- Swahili love expressions with special responses
- Multiple chat interfaces (Classic & WhatsApp style)

### 🎯 **Social Matching Platform**
- **Mobile Navigation** - Professional tab-based interface (Discover, Chats, Matches, Profile)
- **AI-Powered Matching** - Advanced compatibility algorithm with personality analysis
- **Profile System** - Complete profile creation with photos, interests, and personality assessment
- **Discovery Feed** - Swipe-based matching with compatibility scores
- **Matches Screen** - View mutual matches with detailed compatibility breakdowns
- **Safety Features** - User reporting, blocking, privacy controls

### 🧠 **Advanced Matching Algorithm**
- **Personality Compatibility (40%)** - Big 5 personality traits analysis
- **Interest Overlap (25%)** - Weighted shared interests matching
- **Geographic Proximity (20%)** - Location-based compatibility
- **Demographics (10%)** - Age and preference matching
- **Activity Level (5%)** - Recent activity scoring

### 🛡️ **Security & Privacy**
- Complete privacy control center
- User blocking and reporting system
- Incognito mode and visibility settings
- Data export and account deletion
- GDPR compliance features

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **AI**: OpenAI GPT-4o-mini API
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Voice**: Web Speech API (Speech Recognition + Speech Synthesis)
- **PWA**: Vite PWA Plugin + Workbox
- **Mobile**: Capacitor (iOS/Android deployment)
- **Animations**: CSS animations + future Lottie integration

## Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/DavidLai82/CompanionAi.git
cd CompanionAi
npm install --legacy-peer-deps
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env
```

Edit `.env` with your API keys:

```env
# Supabase (required)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (required for AI chat) 
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Optional
VITE_APP_NAME=Irene Companion AI
VITE_APP_VERSION=1.0.0
```

### 3. Database Setup

1. **Create Supabase Project**
   - Go to https://supabase.com and create a new project
   - Note your project URL and anon key

2. **Set Up Database Schema**
   ```bash
   # Run the base schema
   supabase db reset
   # Or manually run these SQL files in Supabase SQL Editor:
   # - supabase-schema.sql (base schema)
   # - supabase-social-schema.sql (social features)
   ```

3. **Deploy Edge Functions**
   ```bash
   # Deploy matching algorithm functions
   supabase functions deploy advanced-matching
   supabase functions deploy chat-with-irene
   supabase functions deploy compatibility-matching
   supabase functions deploy personality-analysis
   ```

4. **Configure Authentication**
   - Enable email auth in Supabase dashboard
   - Optionally add Google, GitHub, etc. providers

### 4. Development & Deployment

```bash
# Start development server
npm run dev

# Run all checks and build
./deploy.sh

# Or build manually
npm run build
```

## 🚀 Deployment Options

### **Vercel (Recommended)**
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push

### **Netlify**
1. Connect repository or drag `dist` folder
2. Configure environment variables
3. Use included `netlify.toml` for settings

### **Manual Deployment**
```bash
# Build the project
npm run build

# Upload 'dist' folder to any static hosting service
# (Hostinger, GitHub Pages, Firebase Hosting, etc.)
```

### Mobile App Deployment

```bash
# Initialize Capacitor (first time only)
npm run cap:init

# Add mobile platforms
npm run cap:add:android
npm run cap:add:ios

# Build and sync
npm run cap:build

# Run on device/simulator
npm run android
npm run ios
```

## Configuration

The app includes complete configuration for:
- PWA manifest and service worker
- Supabase database schema
- OpenAI personality system
- Voice recognition setup
- Mobile app deployment
- Romantic UI/UX theming

---

*Built with 💕 for romantic AI companionship*