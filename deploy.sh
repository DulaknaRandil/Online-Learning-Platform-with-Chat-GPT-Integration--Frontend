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
# Remove package-lock.json to avoid platform-specific dependencies
if [ -f "package-lock.json" ]; then
    echo "🧹 Removing package-lock.json to avoid platform conflicts..."
    rm package-lock.json
fi
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
echo "3. Set environment variables in Vercel dashboard:"
echo "   - NEXT_PUBLIC_API_URL=https://your-backend-api.vercel.app/api"
echo "   - NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app"
echo "4. Deploy!"
echo ""
echo "💡 See DEPLOYMENT.md for detailed instructions"
