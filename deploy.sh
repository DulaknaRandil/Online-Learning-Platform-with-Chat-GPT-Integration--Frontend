#!/bin/bash

# Deployment script for Vercel
echo "🚀 Starting deployment preparation..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running ESLint..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

echo "✅ Frontend is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
