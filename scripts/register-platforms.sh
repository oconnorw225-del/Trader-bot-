#!/bin/bash
# Platform Registration Script
# Automates the registration process for all supported platforms

set -e

echo "🚀 Auto-Start Platform Registration"
echo "===================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if registration wizard exists
if [ ! -f "scripts/registration-wizard.js" ]; then
    echo "❌ Registration wizard not found."
    exit 1
fi

echo "📋 This script will guide you through registering on AI job platforms."
echo "   You'll need to:"
echo "   - Provide email addresses for registration"
echo "   - Complete CAPTCHA/verification manually"
echo "   - Save API keys when provided"
echo ""

read -p "Press Enter to continue or Ctrl+C to cancel..."
echo ""

# Run the registration wizard
echo "🔧 Starting registration wizard..."
node scripts/registration-wizard.js

echo ""
echo "✅ Registration process complete!"
echo ""
echo "Next steps:"
echo "1. Verify your email addresses for each platform"
echo "2. Complete any additional verification steps"
echo "3. Check .env file for saved API keys"
echo "4. Run 'npm run autostart' to start the bot"
echo ""
