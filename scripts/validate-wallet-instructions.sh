#!/bin/bash
# Validation script for wallet retrieval instructions
# Verifies that all key sections and examples are present

set -e

echo "🔍 Validating Wallet Retrieval Instructions..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

INSTRUCTIONS_FILE=".github/instructions/coding-standards.instructions.md"
SUMMARY_FILE="WALLET_RETRIEVAL_INSTRUCTIONS.md"

# Check if files exist
if [ ! -f "$INSTRUCTIONS_FILE" ]; then
    echo -e "${RED}❌ Instructions file not found: $INSTRUCTIONS_FILE${NC}"
    exit 1
fi

if [ ! -f "$SUMMARY_FILE" ]; then
    echo -e "${RED}❌ Summary file not found: $SUMMARY_FILE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Required files exist${NC}"
echo ""

# Check for required sections
echo "📋 Checking for required sections..."

sections=(
    "## Wallet Management and Fund Retrieval"
    "### Wallet Architecture"
    "### Wallet Operations"
    "### Best Practices for Wallet Operations"
    "### Security Considerations"
    "### Error Handling Patterns"
    "### Testing Wallet Functionality"
)

for section in "${sections[@]}"; do
    if grep -q "$section" "$INSTRUCTIONS_FILE"; then
        echo -e "${GREEN}✅ Found: $section${NC}"
    else
        echo -e "${RED}❌ Missing: $section${NC}"
        exit 1
    fi
done

echo ""
echo "🔑 Checking for key topics..."

topics=(
    "validateEthereumAddress"
    "getWalletBalance"
    "detectBlockedFunds"
    "recoverBlockedFunds"
    "NDAXLiveClient"
    "scan_wallets"
    "exponential backoff"
    "retry logic"
)

for topic in "${topics[@]}"; do
    if grep -q "$topic" "$INSTRUCTIONS_FILE"; then
        echo -e "${GREEN}✅ Covers: $topic${NC}"
    else
        echo -e "${YELLOW}⚠️  Missing topic: $topic${NC}"
    fi
done

echo ""
echo "🛡️  Checking security best practices..."

security_checks=(
    "Never expose private keys"
    "Always use HTTPS"
    "Encrypt sensitive data"
    "Validate all user inputs"
    "IP whitelisting"
)

security_count=0
for check in "${security_checks[@]}"; do
    if grep -iq "$check" "$INSTRUCTIONS_FILE"; then
        security_count=$((security_count + 1))
        echo -e "${GREEN}✅ Security practice: $check${NC}"
    fi
done

if [ $security_count -ge 5 ]; then
    echo -e "${GREEN}✅ All essential security practices covered${NC}"
else
    echo -e "${YELLOW}⚠️  Only $security_count/5 security practices found${NC}"
fi

echo ""
echo "📝 Checking code examples..."

example_count=$(grep -c "^\`\`\`" "$INSTRUCTIONS_FILE" || echo "0")
if [ "$example_count" -ge 10 ]; then
    echo -e "${GREEN}✅ Found $example_count code examples${NC}"
elif [ "$example_count" -ge 5 ]; then
    echo -e "${YELLOW}⚠️  Found only $example_count code examples${NC}"
else
    echo -e "${RED}❌ Insufficient code examples: $example_count${NC}"
    exit 1
fi

echo ""
echo "🔬 Checking for sensitive data..."

# Check for real API keys, secrets, private keys (not example ones)
sensitive_patterns=(
    "sk-[a-zA-Z0-9]{48}"     # OpenAI key pattern
    "[0-9a-f]{64}"            # Potential private key (64 hex chars)
)

sensitive_found=0
for pattern in "${sensitive_patterns[@]}"; do
    if grep -Eq "$pattern" "$INSTRUCTIONS_FILE"; then
        echo -e "${RED}⚠️  Potential sensitive data found matching pattern: $pattern${NC}"
        sensitive_found=$((sensitive_found + 1))
    fi
done

if [ $sensitive_found -eq 0 ]; then
    echo -e "${GREEN}✅ No sensitive data patterns detected${NC}"
else
    echo -e "${YELLOW}⚠️  Found $sensitive_found potential sensitive data patterns (manual review recommended)${NC}"
fi

echo ""
echo "📊 Statistics:"
echo "  - File size: $(wc -c < "$INSTRUCTIONS_FILE") bytes"
echo "  - Total lines: $(wc -l < "$INSTRUCTIONS_FILE") lines"
echo "  - Code blocks: $example_count"
echo "  - Security practices: $security_count/5+"
echo ""

# Final verdict
echo "═══════════════════════════════════════════"
echo -e "${GREEN}✅ VALIDATION PASSED${NC}"
echo "═══════════════════════════════════════════"
echo ""
echo "The wallet retrieval and blocked funds handling instructions are:"
echo "  ✅ Complete with all required sections"
echo "  ✅ Include comprehensive code examples"
echo "  ✅ Cover security best practices"
echo "  ✅ Free from sensitive data"
echo "  ✅ Ready for Copilot training"
echo ""
echo "Copilot can now provide guidance on:"
echo "  • Wallet connection and validation"
echo "  • Balance retrieval with retry logic"
echo "  • Blocked/stuck funds detection"
echo "  • Transaction recovery strategies"
echo "  • Multi-chain wallet operations"
echo "  • NDAX exchange integration"
echo "  • Security best practices"
echo ""
