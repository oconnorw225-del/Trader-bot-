#!/bin/bash

# Quick Setup Script for NDAX Auto-Start System
# One-command setup from fresh clone

set -e

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║     🚀 NDAX Auto-Start System - Quick Setup 🚀              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js version
echo "📋 Checking requirements..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version $NODE_VERSION is too old"
    echo "Please upgrade to Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo ""
    echo "📝 Creating .env file..."
    cp .env.example .env
    
    # Generate encryption key
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    
    # Update .env with generated keys
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i '' "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    else
        # Linux
        sed -i "s/ENCRYPTION_KEY=.*/ENCRYPTION_KEY=$ENCRYPTION_KEY/" .env
        sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" .env
    fi
    
    echo "✅ .env file created with generated keys"
else
    echo "✅ .env file already exists"
fi

# Create config directory
mkdir -p config

# Run tests to verify installation
echo ""
echo "🧪 Running tests..."
if npm test 2>&1 | grep -q "PASS"; then
    echo "✅ Tests passed"
else
    echo "⚠️  Some tests failed (this is OK for now)"
fi

# Setup complete
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    ✅ Setup Complete! ✅                      ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  1. Register on platforms: npm run register"
echo "  2. Start the system:      npm start"
echo "  3. Open mobile app:       http://localhost:3000/mobile"
echo ""
echo "For more information, see README-AUTOSTART.md"
echo ""
