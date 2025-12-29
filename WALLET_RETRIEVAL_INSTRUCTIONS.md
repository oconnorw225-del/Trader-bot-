# Wallet Retrieval and Blocked Funds Handling Instructions

## Overview

This document summarizes the comprehensive wallet management and fund retrieval instructions that have been added to the NDAX Quantum Engine's Copilot training materials.

## What Was Added

New comprehensive instructions have been added to guide Copilot (and developers) on handling wallet operations, fund retrieval, and blocked/stuck transaction scenarios.

### Location of Instructions

The instructions are located in:
- **Primary:** `.github/instructions/coding-standards.instructions.md` (Section: "Wallet Management and Fund Retrieval")
- **Reference:** `.github/copilot-instructions.md` (Updated with change summary)

## Key Topics Covered

### 1. Wallet Architecture
- Overview of wallet management components
- Key files: `blockchainManager.js`, `ethereumValidator.js`, NDAX platform integrations
- Multi-chain support (Bitcoin, Ethereum, TRON)

### 2. Wallet Operations

#### Connection and Validation
- Address validation before operations
- Normalized address handling (lowercase for consistency)
- Error handling for invalid addresses

#### Balance Retrieval
- Retry logic with exponential backoff
- Error handling for network failures
- NDAX exchange balance retrieval
- Multi-chain balance checking

#### Blocked/Stuck Funds Handling
- Detection strategies for blocked funds
- Common causes: insufficient gas, network congestion, failed smart contracts, exchange delays
- Recovery strategies:
  - **Speed Up:** Increase gas price and resubmit
  - **Cancel:** Send 0 ETH transaction with same nonce
  - **Replace:** Submit new transaction with higher gas
  - **Auto:** Automatically choose best strategy based on conditions

### 3. Multi-Chain Support
- Bitcoin wallet scanning via `scan_wallets.py`
- TRON wallet operations
- Ethereum and EVM-compatible chains
- Unified interface for cross-chain operations

### 4. NDAX Exchange Integration
- Withdrawal handling with status monitoring
- Timeout mechanisms for long-running operations
- Exchange-specific error handling
- API retry logic

### 5. Best Practices
1. Always validate addresses before operations
2. Implement retry logic with exponential backoff
3. Log all wallet operations for audit trails
4. Never hardcode wallet addresses or private keys
5. Use normalized addresses for consistency
6. Monitor gas prices before transactions
7. Implement timeout mechanisms
8. Provide clear error messages with recovery recommendations
9. Test thoroughly on testnets before using real funds
10. Implement rate limiting to avoid API throttling

### 6. Security Considerations
- Never expose private keys in logs or error messages
- Always use HTTPS for API calls involving wallet data
- Encrypt sensitive data using AES-256
- Implement IP whitelisting for exchange API keys
- Use read-only API keys for balance checking
- Validate all user inputs to prevent injection attacks
- Implement multi-factor authentication for withdrawals
- Monitor for suspicious activity
- Keep dependencies updated
- Use hardware wallets for large amounts

### 7. Error Handling Patterns
- Categorized error responses
- User-friendly error messages
- Technical details for debugging
- Recommended actions for users
- Error categories: user_rejection, network_error, insufficient_balance, gas_error, unknown_error

### 8. Testing Guidelines
- Comprehensive test examples for wallet operations
- Balance retrieval testing
- Invalid address handling
- Network failure retry testing
- Test-driven development approach

## Code Examples Provided

The instructions include numerous code examples demonstrating:

### JavaScript/Node.js Examples
- Wallet address validation
- Balance retrieval with retry logic
- Blocked funds detection algorithm
- Transaction recovery strategies (speed up, cancel, replace)
- Comprehensive error handling
- Testing patterns with Jest

### Python Examples
- NDAX balance retrieval with retry logic
- Withdrawal handling with status monitoring
- Multi-chain wallet scanning
- Error handling patterns

## How Copilot Will Use These Instructions

When developers interact with Copilot on tasks involving:
- Wallet operations
- Fund retrieval
- Transaction monitoring
- Blockchain integrations
- Exchange withdrawals
- Stuck transaction recovery

Copilot will now:
1. Follow the established patterns and best practices
2. Implement proper error handling and retry logic
3. Use the correct validation and normalization procedures
4. Apply security best practices
5. Provide comprehensive error messages
6. Include appropriate logging and monitoring
7. Implement testing as shown in examples

## Testing the Instructions

To verify the instructions are working:

1. **Ask Copilot** to help with a wallet-related task:
   ```
   "Create a function to retrieve wallet balance with retry logic"
   ```

2. **Review Copilot's suggestions** - they should:
   - Include address validation
   - Implement retry logic with exponential backoff
   - Have proper error handling
   - Log operations appropriately
   - Return structured response objects

3. **Check for security best practices**:
   - No hardcoded addresses or keys
   - Proper input validation
   - Encrypted storage of sensitive data
   - HTTPS for API calls

## Benefits

With these instructions, the NDAX Quantum Engine now has:

✅ **Comprehensive wallet management guidelines** for all developers
✅ **Copilot training** for wallet-related coding tasks
✅ **Security best practices** to prevent common vulnerabilities
✅ **Error handling patterns** for robust operation
✅ **Multi-chain support** documentation
✅ **Recovery strategies** for blocked/stuck funds
✅ **Testing examples** for quality assurance
✅ **Production-ready code patterns** for real-world use

## Related Files

- `.github/instructions/coding-standards.instructions.md` - Main instructions file
- `.github/copilot-instructions.md` - Backward compatibility reference
- `src/shared/blockchainManager.js` - Ethereum wallet operations
- `src/shared/ethereumValidator.js` - Address validation
- `platform/ndax_live.py` - NDAX exchange integration
- `platform/ndax_test.py` - Test mode wallet simulation
- `scan_wallets.py` - Multi-chain wallet scanner
- `NDAX_TRADING_SETUP.md` - NDAX wallet setup guide

## Next Steps

1. **Developers** can now use Copilot more effectively for wallet-related tasks
2. **Code reviews** should verify adherence to these guidelines
3. **Testing** should follow the patterns outlined in the instructions
4. **Security audits** can reference these best practices
5. **New features** involving wallets should implement these patterns

## Questions or Issues?

If you encounter any issues with wallet operations or need clarification on the instructions:

1. Review the instructions in `.github/instructions/coding-standards.instructions.md`
2. Check existing implementations in `src/shared/blockchainManager.js`
3. Refer to `NDAX_TRADING_SETUP.md` for NDAX-specific guidance
4. Open an issue for additional guidance or improvements

## Version

- **Added:** 2025-12-29
- **Status:** Production Ready
- **Coverage:** Comprehensive
- **Last Updated:** 2025-12-29
