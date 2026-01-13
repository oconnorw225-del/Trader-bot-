# Take It Back - Quick Start Guide

Get started with automated fund retrieval in 5 minutes.

## Prerequisites

- GitHub account with repository access
- Basic understanding of cryptocurrency wallets
- API keys (for active mode only)

## Step 1: Run Your First Scan (Safe Mode)

1. Navigate to **GitHub Actions** tab in your repository
2. Select **"Take It Back - Automated Fund Retrieval"** workflow
3. Click **"Run workflow"** button
4. Use these settings:
   ```
   Mode: scan_only
   Chains: BTC,ETH,TRON,NDAX
   Min Value: 10.0
   Dry Run: true (checked)
   Verbose: false
   ```
5. Click **"Run workflow"** (green button)

**Result:** Workflow will scan all wallets and generate a report. No funds will be moved.

## Step 2: Review the Results

1. Wait for workflow to complete (~2-5 minutes)
2. Click on the workflow run
3. Download artifacts:
   - `wallet-scan-results-XXX`
   - `final-report-XXX`
4. Open `SUMMARY.md` to see overview
5. Check `wallet_inventory.json` for details

## Step 3: Understand the Report

The report shows:
- **Wallets Found**: Number of wallets discovered
- **Chains Analyzed**: Which blockchains were scanned
- **Total Value**: Aggregate balance in USD
- **Stuck Transactions**: Any pending transactions

Example summary:
```
Wallets Scanned: 5
Stuck Transactions: 0
Total Value: $123.45 USD
Chains Analyzed: BTC,ETH,TRON,NDAX
```

## Step 4: (Optional) Test Retrieval in Dry Run

If you want to see what would happen in retrieval mode:

1. Run workflow again with:
   ```
   Mode: retrieve
   Dry Run: true (keep checked!)
   ```
2. Review the generated transaction plan
3. No actual funds will be moved

## Step 5: (Advanced) Active Retrieval

⚠️ **Only proceed if you understand the risks**

### Before Running Active Mode:

1. **Set up GitHub Secrets** (if not already done):
   ```
   Repository Settings > Secrets > Actions
   
   Add:
   - NDAX_API_KEY (for NDAX chain)
   - NDAX_API_SECRET (for NDAX chain)
   - ETHEREUM_RPC_URL (for ETH chain)
   - DESTINATION_WALLET (where to send funds)
   ```

2. **Test on Testnet First** (recommended)

3. **Run with Minimal Amount**:
   ```
   Mode: retrieve
   Chains: ETH (start with one chain)
   Min Value: 10.0 (start small)
   Dry Run: false (⚠️ UNCHECK THIS)
   ```

4. **Monitor Closely**:
   - Watch workflow logs in real-time
   - Check destination wallet after completion
   - Verify transactions on blockchain explorers

## Common Use Cases

### Use Case 1: Find All Wallets
```yaml
Mode: scan_only
Chains: BTC,ETH,TRON,NDAX
Dry Run: true
```

### Use Case 2: Check for Stuck Transactions
```yaml
Mode: recover
Chains: ETH
Dry Run: true
```

### Use Case 3: Retrieve from NDAX Exchange
```yaml
Mode: retrieve
Chains: NDAX
Min Value: 50.0
Dry Run: false  # ⚠️ Active mode
```

### Use Case 4: Consolidate Bitcoin Wallets
```yaml
Mode: retrieve
Chains: BTC
Min Value: 20.0
Dry Run: false  # ⚠️ Active mode
```

## Safety Reminders

✅ **Always start with scan_only mode**
✅ **Keep dry_run enabled for testing**
✅ **Use small amounts first in active mode**
✅ **Review logs after each run**
✅ **Monitor wallet balances independently**

❌ **Never disable dry run without review**
❌ **Never commit API keys to repository**
❌ **Never run active mode without testing first**

## Troubleshooting

### "Workflow didn't run"
- Check if kill switch is active (`.chimera/AUTONOMOUS_DISABLED`)
- Verify GitHub Actions are enabled
- Check rate limits (max 10 runs per day)

### "No wallets found"
- Verify wallet addresses in configuration
- Check blockchain API connectivity
- Review wallet enumeration logs

### "Transaction failed"
- Check gas prices and fees
- Verify API credentials
- Review error in workflow logs
- See [Full Documentation](./TAKE_IT_BACK_WORKFLOW.md)

## Next Steps

1. ✅ Run first scan (completed)
2. 📚 Read [Full Documentation](./TAKE_IT_BACK_WORKFLOW.md)
3. 🔒 Review [Security Best Practices](./TAKE_IT_BACK_WORKFLOW.md#security-best-practices)
4. 🧪 Test retrieval in dry run mode
5. 💰 (Optional) Run active retrieval with caution

## Quick Reference Commands

### Local Testing
```bash
# Test wallet enumeration
python3 ops/enumerate_wallets.py --audit-only --chains BTC,ETH

# Test fund retrieval (dry run)
python3 ops/retrieve_funds.py --mode scan --dry-run

# Test with verbose logging
python3 ops/retrieve_funds.py --mode retrieve --dry-run --verbose
```

### Emergency Stop
```bash
# Create kill switch
mkdir -p .chimera
echo "EMERGENCY STOP" > .chimera/AUTONOMOUS_DISABLED
git add .chimera/AUTONOMOUS_DISABLED
git commit -m "🛑 Emergency stop"
git push
```

## Support

Need help?
- 📖 [Full Documentation](./TAKE_IT_BACK_WORKFLOW.md)
- 🐛 [Report Issue](https://github.com/oconnorw225-del/Trader-bot-/issues/new?labels=take-it-back)
- 💬 Check existing issues for similar problems

---

**Remember:** Always start with scan_only and dry_run enabled!
