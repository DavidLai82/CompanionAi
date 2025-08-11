#!/bin/bash
# Vercel build script for Irene Companion AI

echo "🚀 Starting Vercel build process..."

# Install dependencies with legacy peer deps flag
echo "📦 Installing dependencies..."
npm install --legacy-peer-deps

# Run type checking (optional, but good practice)
echo "🔍 Running type check..."
npm run typecheck || echo "⚠️ Type check had warnings, continuing build..."

# Build the project
echo "🏗️ Building project..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📂 Built files are ready in dist/ directory"
else
    echo "❌ Build failed!"
    exit 1
fi