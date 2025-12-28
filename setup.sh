#!/bin/bash
# NDAX Quantum Engine Setup Script
# One-time setup for the system

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   NDAX Quantum Engine                    ║"
echo "║   Initial Setup                          ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Detect environment
if [ -n "$TERMUX_VERSION" ]; then
    ENVIRONMENT="Termux (Android)"
    echo "📱 Detected: $ENVIRONMENT"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    ENVIRONMENT="macOS"
    echo "🍎 Detected: $ENVIRONMENT"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    ENVIRONMENT="Linux"
    echo "🐧 Detected: $ENVIRONMENT"
else
    ENVIRONMENT="Unknown"
    echo "❓ Detected: $ENVIRONMENT"
fi
echo ""

# Check Node.js
echo "Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo ""
    echo "Installation instructions:"
    
    if [ -n "$TERMUX_VERSION" ]; then
        echo "  pkg update && pkg upgrade"
        echo "  pkg install nodejs git"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "  Install from: https://nodejs.org/"
        echo "  Or use Homebrew: brew install node"
    else
        echo "  Install from: https://nodejs.org/"
        echo "  Or use package manager:"
        echo "    Ubuntu/Debian: sudo apt install nodejs npm"
        echo "    Fedora: sudo dnf install nodejs"
    fi
    echo ""
    exit 1
else
    echo "✓ Node.js $(node --version)"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
else
    echo "✓ npm $(npm --version)"
fi

# Check Python (optional)
if command -v python3 &> /dev/null; then
    echo "✓ Python $(python3 --version 2>&1 | awk '{print $2}')"
    PYTHON_AVAILABLE=true
else
    echo "⚠️  Python not found (optional for Flask backend)"
    PYTHON_AVAILABLE=false
fi

echo ""
echo "Installing Node.js dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✓ Node.js dependencies installed successfully"
else
    echo "❌ Failed to install Node.js dependencies"
    exit 1
fi

# Install Python dependencies if Python is available
if [ "$PYTHON_AVAILABLE" = true ]; then
    echo ""
    echo "Installing Python dependencies..."
    cd backend/python
    if pip3 install -r requirements.txt --quiet 2>/dev/null || pip install -r requirements.txt --quiet 2>/dev/null; then
        echo "✓ Python dependencies installed successfully"
    else
        echo "⚠️  Failed to install Python dependencies (optional)"
    fi
    cd ../..
fi

# Create .env file if it doesn't exist
echo ""
if [ ! -f ".env" ]; then
    echo "Creating .env configuration file..."
    cp .env.example .env
    echo "✓ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env to add your API keys"
    echo "   Or leave as-is to run in demo mode"
else
    echo "✓ .env file already exists"
fi

# Create data directories
echo ""
echo "Creating data directories..."
mkdir -p data/logs data/configs data/backups
echo "✓ Data directories created"

# Make scripts executable
echo ""
echo "Setting up scripts..."
chmod +x start.sh
if [ -f "termux-setup.sh" ]; then
    chmod +x termux-setup.sh
fi
echo "✓ Scripts are executable"

# Build the frontend
echo ""
echo "Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo "✓ Frontend built successfully"
else
    echo "❌ Failed to build frontend"
    exit 1
fi

# Run tests
echo ""
echo "Running tests..."
npm test
if [ $? -eq 0 ]; then
    echo "✓ All tests passed!"
else
    echo "⚠️  Some tests failed, but setup is complete"
fi

# Success message
echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✓ Setup Complete!                      ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. (Optional) Edit .env to configure API keys"
echo "   By default, demo mode is enabled (no API keys needed)"
echo ""
echo "2. Start the server:"
echo "   ./start.sh"
echo ""
echo "3. Open your browser:"
echo "   http://localhost:3000"
echo ""

if [ -n "$TERMUX_VERSION" ]; then
    echo "Termux-specific tips:"
    echo "• Use 'termux-wake-lock' to prevent sleep"
    echo "• Install 'Termux:Widget' for home screen shortcuts"
    echo "• Access from PC via 'http://[phone-ip]:3000'"
    echo ""
fi

echo "For more help, see:"
echo "• README.md - Full documentation"
echo "• docs/QUICK_START.md - Quick start guide"
echo "• docs/TERMUX_ANDROID_SETUP.md - Android/Termux guide"
echo ""
