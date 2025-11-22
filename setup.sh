#!/bin/bash

echo "🚀 Netlify Domains Showcase - Quick Setup"
echo "=========================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"
echo ""

# Check for .env.local
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local and add your Netlify access token!"
    echo "   Get your token from: https://app.netlify.com/user/applications#personal-access-tokens"
    echo ""
else
    echo "✅ .env.local already exists"
    echo ""
fi

echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env.local and add your NETLIFY_ACCESS_TOKEN"
echo "2. Run 'npm run dev' to start the development server"
echo "3. Open http://localhost:3000 in your browser"
echo ""
echo "For deployment instructions, see README.md"
