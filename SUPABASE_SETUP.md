# 🔧 Supabase Database Setup Guide

## Overview
Irene Companion AI requires specific database tables to function properly. If these tables don't exist, the app will gracefully fall back to demo mode.

## Option 1: Automatic Demo Mode ✨
The app automatically detects missing tables and provides a fully functional demo experience:
- **No database setup required**
- **Instant functionality** 
- **Perfect for testing and development**

## Option 2: Full Supabase Setup 🚀

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for the database to initialize
4. Copy your project URL and anon key

### Step 2: Update Environment Variables
```bash
# Update .env file
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_OPENAI_API_KEY=your-openai-api-key
```

### Step 3: Create Database Tables
Run the SQL in `create-profiles-table.sql` in your Supabase SQL editor:

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `create-profiles-table.sql`
3. Paste and run the SQL
4. Verify tables are created in the Database section

### Tables Created:
- **`profiles`** - User profile information
- **`personality_assessments`** - Personality test results
- **Row Level Security (RLS)** policies for data protection

### Step 4: Test Connection
Restart your development server:
```bash
npm run dev
```

The app should now connect to your Supabase database instead of using demo mode.

## Troubleshooting

### ✅ App Works in Demo Mode
- Environment variables not configured
- Missing database tables
- **This is expected behavior**

### ❌ App Hangs or Shows Errors
1. **Check environment variables** in `.env`
2. **Verify Supabase project is active**
3. **Run the SQL schema** from `create-profiles-table.sql`
4. **Check browser console** for specific errors

### 🔍 Verify Setup
Check browser console for these messages:
- `"Environment not configured, showing landing page"` → Demo mode ✅
- `"Profiles table not found, using demo mode"` → Missing tables ✅  
- `"Error connecting to Supabase"` → Check credentials ⚠️

## Database Schema

### Profiles Table
```sql
profiles (
  id: uuid (references auth.users)
  preferred_nickname: text
  age: integer
  location: text
  bio: text
  gender: text
  interests: text[]
  created_at: timestamp
  updated_at: timestamp
)
```

### Personality Assessments Table
```sql
personality_assessments (
  id: uuid
  user_id: uuid (references auth.users)
  assessment_data: jsonb
  results: jsonb
  completed_at: timestamp
  created_at: timestamp
)
```

## Security Features
- **Row Level Security (RLS)** enabled
- **User isolation** - users can only access their own data
- **Automatic timestamps** with triggers
- **Foreign key constraints** for data integrity

---

## 🎯 Quick Start Summary

1. **For Development**: Just run the app - demo mode works immediately
2. **For Production**: Set up Supabase with the provided schema
3. **For Testing**: Demo mode provides full functionality without setup

The app is designed to work perfectly in both scenarios! 🚀