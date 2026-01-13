# Take It Back Workflow - Complete Documentation

## Overview

The **Take It Back** workflow is an automated fund retrieval system that combines forensic scanning capabilities with intelligent fund recovery. It integrates the best practices from the existing workflows (`forensic-scan.yml`, `autonomous-guardian.yml`) to provide a comprehensive solution for:

- 🔍 Multi-chain wallet scanning (BTC, ETH, TRON)
- 💰 NDAX exchange fund retrieval
- 🔧 Stuck transaction recovery
- 🔄 Automated fund consolidation
- 📊 Comprehensive reporting and audit trails

**Status:** Production-ready with comprehensive safety checks

## Key Features

### 1. Safety First Design

- **Kill Switch Support**: Respects `.chimera/AUTONOMOUS_DISABLED` flag
- **Dry Run Default**: All operations start in dry-run mode
- **Rate Limiting**: Prevents excessive workflow executions
- **Pre-flight Checks**: Validates safety constraints before execution
- **Error Recovery**: Automatic rollback detection and alerting

### 2. Multi-Phase Execution

#### Phase 1: Wallet Scanning
- Discovers all accessible wallets across multiple chains
- Checks balances using public APIs (read-only)
- Generates comprehensive wallet inventory
- Integration: `ops/enumerate_wallets.py`, `scan_wallets.py`

#### Phase 2: Stuck Transaction Detection
- Identifies pending transactions > 1 hour old
- Analyzes network congestion and gas prices
- Recommends recovery strategies
- Integration: `src/shared/blockchainManager.js`

#### Phase 3: Fund Retrieval (Conditional)
- NDAX exchange withdrawals
- Ethereum wallet consolidation
- Bitcoin/TRON fund transfers
- Stuck transaction recovery
- Integration: `ops/retrieve_funds.py`, `platform/ndax_live.py`

#### Phase 4: Reporting
- Generates JSON and CSV reports
- Creates GitHub issues for non-dry-run operations
- Uploads artifacts with 90-day retention
- Integration: `ops/generate_report.py`

### 3. Error Handling & Recovery

- **Graceful Failures**: Continues on individual wallet errors
- **Automatic Alerts**: Creates GitHub issues on failures
- **Rollback Detection**: Identifies when manual intervention is needed
- **Comprehensive Logging**: Full audit trail for all operations

## Usage

### Quick Start

#### 1. Scan Mode (Safe, Read-Only)
```bash
# Trigger via GitHub Actions UI
# Mode: scan_only
# Dry Run: true
# Chains: BTC,ETH,TRON,NDAX
```

This will:
- ✅ Scan all wallets
- ✅ Check balances
- ✅ Detect stuck transactions
- ❌ No actual fund movements

#### 2. Retrieve Mode (Dry Run)
```bash
# Mode: retrieve
# Dry Run: true
# Min Value: 10.0
```

This will:
- ✅ Scan all wallets
- ✅ Simulate fund retrieval
- ✅ Generate transaction plans
- ❌ No actual transactions

#### 3. Retrieve Mode (Active - USE WITH CAUTION)
```bash
# Mode: retrieve
# Dry Run: false
# Min Value: 10.0
```

This will:
- ⚠️ Scan all wallets
- ⚠️ Execute real withdrawals
- ⚠️ Move actual funds
- ⚠️ Requires proper API keys

### Manual Trigger

1. Go to GitHub Actions tab
2. Select "Take It Back - Automated Fund Retrieval"
3. Click "Run workflow"
4. Configure options:
   - **Mode**: `scan_only` | `retrieve` | `recover`
   - **Chains**: `BTC,ETH,TRON,NDAX` (or subset)
   - **Min Value**: Minimum USD value to retrieve
   - **Dry Run**: `true` (recommended) | `false`
   - **Verbose**: Enable detailed logging

### Scheduled Execution

The workflow runs automatically every Sunday at 2 AM UTC in scan-only mode.

To change the schedule, edit `.github/workflows/take-it-back.yml`:
```yaml
schedule:
  - cron: '0 2 * * 0'  # Every Sunday at 2 AM UTC
```

## Configuration

### Environment Variables

Required for active mode (retrieve/recover):

```bash
# NDAX Exchange (if using NDAX chain)
NDAX_API_KEY=your_api_key
NDAX_API_SECRET=your_api_secret

# Ethereum (if using ETH chain)
ETHEREUM_RPC_URL=your_rpc_url
ETHEREUM_WALLET_KEY=your_wallet_private_key  # NEVER commit this

# Destination Wallet (for fund consolidation)
DESTINATION_WALLET_ADDRESS=0x...
```

**Security Note:** Use GitHub Secrets for all sensitive values. Never commit credentials.

### Workflow Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `mode` | choice | `scan_only` | Operation mode |
| `chains` | string | `BTC,ETH,TRON,NDAX` | Chains to process |
| `min_value_usd` | string | `10.0` | Minimum value threshold |
| `dry_run` | boolean | `true` | Enable dry run mode |
| `verbose` | boolean | `false` | Verbose logging |

### Kill Switch

To disable all automated operations:

```bash
# Create kill switch file
mkdir -p .chimera
cat > .chimera/AUTONOMOUS_DISABLED << EOF
AUTONOMOUS SYSTEM DISABLED

Reason: Manual intervention
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

To re-enable, delete this file.
EOF

# Commit and push
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "🛑 Activate kill switch"
git push
```

## Integration Points

### Existing Components

The workflow integrates with:

1. **Wallet Enumeration** (`ops/enumerate_wallets.py`)
   - Discovers wallets across multiple chains
   - Generates JSON inventory
   - Audit-only mode (read-only)

2. **Multi-Chain Scanner** (`scan_wallets.py`)
   - Scans BTC and TRON wallets
   - Retrieves balances and transaction history
   - Uses public APIs (mempool.space, TRONSCAN)

3. **Blockchain Manager** (`src/shared/blockchainManager.js`)
   - Ethereum wallet operations
   - Transaction management
   - Web3 integration

4. **NDAX Integration** (`platform/ndax_live.py`)
   - Exchange balance retrieval
   - Withdrawal operations
   - Status monitoring

5. **Report Generator** (`ops/generate_report.py`)
   - Creates JSON and CSV reports
   - Aggregates data from all sources
   - Generates summaries and statistics

### New Components

1. **Fund Retrieval Script** (`ops/retrieve_funds.py`)
   - Orchestrates fund retrieval operations
   - Handles multi-chain complexity
   - Implements retry logic and error handling

2. **Take It Back Workflow** (`.github/workflows/take-it-back.yml`)
   - Main automation workflow
   - Multi-phase execution
   - Safety checks and error recovery

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Actions Trigger                   │
│              (Manual / Scheduled / API Call)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Phase 0: Safety Check                      │
│  - Kill switch verification                                  │
│  - Mode validation                                           │
│  - Rate limit check                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   Phase 1: Wallet Scan                       │
│  - ops/enumerate_wallets.py                                  │
│  - scan_wallets.py (BTC/TRON)                               │
│  - Balance checking                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Phase 2: Stuck Transaction Detection            │
│  - src/shared/blockchainManager.js                          │
│  - Pending transaction analysis                              │
│  - Recovery strategy recommendation                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Phase 3: Fund Retrieval (Conditional)           │
│  - ops/retrieve_funds.py                                     │
│  - platform/ndax_live.py (NDAX)                             │
│  - Transaction execution                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                Phase 4: Reporting                            │
│  - ops/generate_report.py                                    │
│  - Artifact upload                                           │
│  - GitHub issue creation                                     │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              Error Handler (on failure)                      │
│  - Analyze failure point                                     │
│  - Rollback detection                                        │
│  - Alert issue creation                                      │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling

### Common Errors and Solutions

#### 1. API Rate Limiting
**Error:** "Too many requests"
**Solution:** Workflow includes automatic retry with exponential backoff

#### 2. Insufficient Gas Fees
**Error:** "Transaction underpriced"
**Solution:** Automatically adjusts gas price in retry attempts

#### 3. Network Connectivity
**Error:** "Network request failed"
**Solution:** Retries with different RPC endpoints

#### 4. Authentication Failure
**Error:** "Invalid API credentials"
**Solution:** Verify GitHub Secrets are configured correctly

### Rollback Procedures

If a retrieval operation fails mid-execution:

1. **Check Transaction Status**
   ```bash
   # Ethereum
   https://etherscan.io/tx/<transaction_hash>
   
   # Bitcoin
   https://mempool.space/tx/<transaction_hash>
   ```

2. **Review Workflow Logs**
   - Download artifacts from failed workflow run
   - Check error messages in logs

3. **Manual Recovery (if needed)**
   ```bash
   # Speed up stuck transaction
   python3 ops/retrieve_funds.py --mode recover --chains ETH --no-dry-run
   ```

4. **Contact Support**
   - Create GitHub issue with error details
   - Include workflow run number and logs

## Merge Conflict Handling

The workflow follows non-destructive principles from `main.yml`:

### Strategy
1. **Backup Before Changes**: Creates backup branches/tags
2. **Separate Test Branches**: Never modifies original branches
3. **CI Validation**: Runs tests before merging
4. **Manual Review**: Requires human approval for merges

### Resolution Process
1. Workflow creates rebased test branches
2. CI runs on test branches
3. On conflict: Creates GitHub issue for manual resolution
4. Maintainer reviews and resolves
5. Original branches remain intact

## Testing

### Local Testing

```bash
# 1. Test wallet enumeration
python3 ops/enumerate_wallets.py --audit-only --chains BTC,ETH

# 2. Test fund retrieval (dry run)
python3 ops/retrieve_funds.py --mode scan --dry-run

# 3. Test report generation
python3 ops/generate_report.py \
  --wallet-inventory results/take-it-back/wallet_inventory.json \
  --output-json results/take-it-back/report.json
```

### Workflow Testing

```bash
# Test in GitHub Actions
# 1. Go to Actions tab
# 2. Select "Take It Back" workflow
# 3. Click "Run workflow"
# 4. Use these settings:
#    - Mode: scan_only
#    - Dry Run: true
#    - Verbose: true
```

### Validation Checklist

- [ ] Kill switch works correctly
- [ ] Dry run mode prevents real transactions
- [ ] Rate limiting activates at threshold
- [ ] Wallet scanning completes successfully
- [ ] Reports are generated correctly
- [ ] Artifacts are uploaded
- [ ] Error handling creates issues
- [ ] Active mode requires explicit confirmation

## Security Best Practices

1. **Never Disable Dry Run** without thorough review
2. **Use GitHub Secrets** for all credentials
3. **Review Workflow Logs** after each run
4. **Monitor Wallet Balances** independently
5. **Keep API Keys Rotated** regularly
6. **Enable 2FA** on all exchanges
7. **Use Hardware Wallets** for large amounts
8. **Test on Testnets** before mainnet operations

## Monitoring

### Key Metrics

- **Wallets Scanned**: Number of wallets discovered
- **Total Value**: Aggregate USD value across all chains
- **Stuck Transactions**: Number of pending transactions
- **Retrieval Success Rate**: Percentage of successful operations
- **Error Rate**: Number of failed operations

### Alerts

The workflow creates GitHub issues for:
- ⚠️ Workflow failures
- 🚨 Active mode execution (non-dry-run)
- 💰 Successful fund retrievals
- 🔧 Stuck transaction recovery

## Troubleshooting

### Workflow Not Running

Check:
1. Kill switch is not active (`.chimera/AUTONOMOUS_DISABLED`)
2. Rate limit not exceeded
3. GitHub Actions enabled on repository
4. Workflow file has no syntax errors

### Wallet Not Found

Check:
1. Wallet address format is correct
2. Chain is included in `chains` input
3. Wallet enumeration completed successfully
4. API connectivity to blockchain explorers

### Transaction Stuck

Solution:
```bash
# Run recovery mode
python3 ops/retrieve_funds.py \
  --mode recover \
  --chains ETH \
  --no-dry-run
```

## FAQ

**Q: Is it safe to run this workflow?**
A: Yes, in `scan_only` mode with `dry_run: true`. Always review before using active mode.

**Q: What happens if I lose internet during retrieval?**
A: Transactions already broadcasted will complete. Workflow will retry failed operations.

**Q: Can I retrieve from multiple chains simultaneously?**
A: Yes, specify multiple chains: `BTC,ETH,TRON,NDAX`

**Q: How do I know if funds were successfully retrieved?**
A: Check workflow artifacts, GitHub issues, and wallet balances.

**Q: Can I customize the minimum value threshold?**
A: Yes, use the `min_value_usd` input parameter.

## Related Documentation

- [WALLET_RETRIEVAL_INSTRUCTIONS.md](../WALLET_RETRIEVAL_INSTRUCTIONS.md) - Wallet management guide
- [NDAX_TRADING_SETUP.md](../NDAX_TRADING_SETUP.md) - NDAX integration guide
- [.github/instructions/coding-standards.instructions.md](../.github/instructions/coding-standards.instructions.md) - Coding standards

## Version History

- **v1.0.0** (2026-01-13): Initial release
  - Multi-chain wallet scanning
  - NDAX integration
  - Stuck transaction recovery
  - Comprehensive safety checks
  - Error handling and reporting

## Support

For issues or questions:
1. Create GitHub issue with label `take-it-back`
2. Include workflow run number
3. Attach relevant logs/artifacts
4. Describe expected vs actual behavior

---

**Last Updated:** 2026-01-13
**Status:** Production Ready
**Maintainer:** NDAX Quantum Engine Team
