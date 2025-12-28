#!/bin/bash
# NDAX Quantum Engine Startup Script
# Works on Linux, macOS, Termux (Android), and Windows (Git Bash)

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   NDAX Quantum Engine                    ║"
echo "║   Starting System...                     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    echo ""
    echo "For Termux (Android):"
    echo "  pkg install nodejs"
    echo ""
    exit 1
fi

echo "✓ Node.js version: $(node --version)"

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
else
    echo "✓ Dependencies already installed"
fi

# Check for .env file
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "✓ Created .env file - please configure your API keys"
        echo "  Demo mode is enabled by default (no API keys required)"
    else
        echo "❌ Error: .env.example not found"
        exit 1
    fi
else
    echo "✓ Configuration file found"
fi

# Create data directories
mkdir -p data/logs data/configs data/backups
echo "✓ Data directories ready"

# Check if port 3000 is available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Port 3000 is already in use"
    echo "Trying to stop existing server..."
    pkill -f "node.*server.js" || true
    sleep 2
fi

# Start the server
echo ""
echo "🚀 Starting NDAX Quantum Engine..."
echo ""

# Check if we're in Termux
if [ -n "$TERMUX_VERSION" ]; then
    echo "📱 Detected Termux environment"
    echo "Server will run on: http://localhost:3000"
    echo ""
fi

# Start with demo mode by default
export DEMO_MODE=${DEMO_MODE:-true}

if [ "$DEMO_MODE" = "true" ]; then
    echo "🎮 Starting in DEMO MODE (no API keys required)"
else
    echo "🚀 Starting in LIVE MODE"
fi

echo ""
echo "Press Ctrl+C to stop the server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Build the frontend if dist doesn't exist or in production mode
if [ ! -d "dist" ] || [ "$NODE_ENV" = "production" ]; then
    echo "📦 Building frontend..."
    npm run build
    echo "✓ Frontend built successfully"
    echo ""
fi

# Start the Node.js server
node backend/nodejs/server.js
