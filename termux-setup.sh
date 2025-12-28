#!/data/data/com.termux/files/usr/bin/bash
# NDAX Quantum Engine - Termux Setup Script
# Optimized for Android devices running Termux

set -e

echo "╔══════════════════════════════════════════╗"
echo "║   NDAX Quantum Engine                    ║"
echo "║   Termux (Android) Setup                 ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Check if we're running in Termux
if [ -z "$TERMUX_VERSION" ]; then
    echo "⚠️  Warning: This doesn't appear to be Termux"
    echo "This script is optimized for Termux on Android"
    echo "Continue anyway? (y/n)"
    read -r response
    if [ "$response" != "y" ]; then
        exit 0
    fi
fi

echo "📱 Termux version: ${TERMUX_VERSION:-Unknown}"
echo ""

# Update packages
echo "Updating Termux packages..."
echo "This may take a few minutes..."
pkg update -y
echo "✓ Packages updated"
echo ""

# Install required packages
echo "Installing required packages..."
echo ""

# Check and install Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    pkg install nodejs -y
    echo "✓ Node.js installed"
else
    echo "✓ Node.js already installed ($(node --version))"
fi

# Check and install Git
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    pkg install git -y
    echo "✓ Git installed"
else
    echo "✓ Git already installed"
fi

# Install Python (optional)
if ! command -v python &> /dev/null; then
    echo "Installing Python (optional)..."
    pkg install python -y || echo "⚠️  Python installation skipped"
fi

# Install useful utilities
echo ""
echo "Installing helpful utilities..."
pkg install termux-api termux-tools -y || echo "⚠️  Some utilities skipped"

echo ""
echo "✓ All packages installed"
echo ""

# Setup storage access
echo "Setting up storage access..."
echo "You may be prompted to allow storage access - please approve"
termux-setup-storage || echo "⚠️  Storage setup skipped - you can run 'termux-setup-storage' later"

echo ""
echo "Running main setup script..."
echo ""

# Run the main setup script
bash setup.sh

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ✓ Termux Setup Complete!               ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "📱 Termux-Specific Tips:"
echo ""
echo "1. Prevent phone from sleeping:"
echo "   termux-wake-lock"
echo ""
echo "2. Start server in background:"
echo "   nohup ./start.sh > /dev/null 2>&1 &"
echo ""
echo "3. Access from other devices:"
echo "   • Find your phone's IP: ifconfig"
echo "   • Connect to: http://[your-phone-ip]:3000"
echo ""
echo "4. Create home screen widget:"
echo "   • Install 'Termux:Widget' from F-Droid"
echo "   • Create ~/.shortcuts/start-quantum.sh"
echo ""
echo "5. Auto-start on boot:"
echo "   • Install 'Termux:Boot' from F-Droid"
echo "   • Create ~/.termux/boot/start-quantum.sh"
echo ""
echo "Ready to start? Run:"
echo "  ./start.sh"
echo ""
