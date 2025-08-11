#!/bin/bash

# Irene Companion AI Deployment Script
echo "🚀 Starting Irene Companion AI deployment..."

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and configure your environment variables"
    exit 1
fi

# Check for required environment variables
source .env
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ] || [ -z "$VITE_OPENAI_API_KEY" ]; then
    echo "❌ Error: Missing required environment variables!"
    echo "Please ensure VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, and VITE_OPENAI_API_KEY are set in .env"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Run type checking
echo "🔍 Running type check..."
npm run typecheck

# Run linting
echo "🧹 Running linter..."
npm run lint

# Build the project
echo "🏗️ Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "🎉 Irene Companion AI is ready for deployment!"
    echo "📂 Built files are in the 'dist' directory"
    echo ""
    echo "Next steps:"
    echo "1. Deploy the 'dist' folder to your hosting provider"
    echo "2. Set environment variables on your hosting platform"
    echo "3. Set up your Supabase database using the schema files"
    echo "4. Deploy Supabase Edge Functions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi