# Irene - Your AI Companion 💕

A romantic, flirty AI companion PWA with voice chat, Swahili love expressions, and emotional interactions.

## Features

- 💬 **Chat Interface** - Modern, mobile-first chat UI with animated message bubbles
- 🤖 **AI Personality** - Custom romantic personality powered by OpenAI GPT-4o-mini
- 🗣️ **Voice Chat** - Browser-based speech-to-text and text-to-speech
- 💕 **Animated Avatar** - Emotion-based reactions (blush, wink, smile, laugh)
- 📊 **Love Stats** - Track kisses sent, "I love you" count, and romantic interactions  
- 🌍 **Swahili Integration** - Recognizes romantic Swahili phrases with special responses
- 📱 **PWA Ready** - Installable on mobile devices with offline support
- 🎯 **Floating Chat Button** - Quick access from anywhere in the app

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **AI**: OpenAI GPT-4o-mini API
- **Backend**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Voice**: Web Speech API (Speech Recognition + Speech Synthesis)
- **PWA**: Vite PWA Plugin + Workbox
- **Mobile**: Capacitor (iOS/Android deployment)
- **Animations**: CSS animations + future Lottie integration

## Quick Start

### 1. Environment Setup

```bash
# Clone and install dependencies
cd irene-companion
npm install --legacy-peer-deps

# Copy environment template
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your API keys:

```env
# Supabase (required)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI (required) 
REACT_APP_OPENAI_API_KEY=your-openai-api-key
```

### 3. Database Setup

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `supabase-schema.sql` in the Supabase SQL editor
3. Enable Row Level Security (RLS) policies
4. Configure authentication providers (email, Google, etc.)

### 4. Development

```bash
# Start development server
npm run dev

# Build for production
npm run build
```

## Deployment

### Web Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify/etc.
# The dist/ folder contains the built app
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