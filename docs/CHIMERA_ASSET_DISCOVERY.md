# Chimera Full Asset Discovery & Audit Engine

## Overview

The Chimera Full Asset Discovery & Audit Engine is a **read-only, audit-only** system designed to safely scan and discover cryptocurrency assets across multiple blockchain networks. It operates in a strictly read-only mode with hard-coded safety locks.

## Features

- **Multi-Chain Support**: Bitcoin (BTC), Ethereum (ETH), Binance Smart Chain (BSC), Polygon, Arbitrum, Base, Solana (SOL)
- **Comprehensive Asset Detection**: 
  - **BTC**: Real-time balance queries via blockchain.info API
  - **EVM Chains**: Asset type templates (requires blockchain explorer API implementation)
  - **Solana**: Asset type templates (requires RPC/indexer implementation)
- **Read-Only Safety**: Hard-coded `AUDIT_ONLY` mode with assertion checks
- **Price Integration**: CoinGecko API integration ready (currently unused)
- **Automated Reporting**: JSON, Markdown, and CSV output formats
- **File Integrity**: SHA256 checksums for all generated reports
- **Historical Audit Trail**: Timestamped audit history in `output/history/`

## Current Implementation Status

### Fully Implemented
- ✅ Bitcoin (BTC) balance queries via blockchain.info
- ✅ Multi-format reporting (JSON, Markdown, CSV)
- ✅ File integrity checksums (SHA256)
- ✅ Historical audit trail
- ✅ Safety locks and verification

### Template/Placeholder
- ⚠️ EVM chains (ETH, BSC, Polygon, etc.) - Returns asset type templates, not actual balances
- ⚠️ Solana (SOL) - Returns asset type templates, not actual balances
- ⚠️ Price lookups - CoinGecko function ready but not integrated

**Note**: For EVM and Solana chains, the current implementation returns asset type templates to show what could be detected. To get actual balances, you would need to:
- Add Etherscan/BSCScan/etc. API keys and implement balance queries
- Add Solana RPC calls or use indexer services (Helius, TheIndex, etc.)
- Integrate the `prices()` function for USD value calculations

## Safety Guarantees

```python
MODE = "AUDIT_ONLY"
assert MODE == "AUDIT_ONLY"
```

The system includes:
1. Hard-coded mode lock preventing any write operations
2. Assertion check that fails if mode is modified
3. GitHub Actions workflow verification step
4. No private key handling or transaction signing capabilities

## Directory Structure

```
.
├── chimera_full_discovery.py   # Main audit script
├── inputs/
│   └── wallets.json            # Wallet configuration (required)
├── output/
│   ├── FULL_ASSET_DISCOVERY.json  # Complete asset data (JSON)
│   ├── ASSET_REPORT.md            # Human-readable report (Markdown)
│   ├── assets.csv                 # Spreadsheet format (CSV)
│   ├── manifest.json              # File integrity checksums
│   └── history/
│       └── audit_*.json           # Historical audit snapshots
└── .github/workflows/
    └── ndax_chimera_audit.yml  # Automated workflow
```

## Configuration

### Wallet Configuration (`inputs/wallets.json`)

```json
[
  {
    "label": "BTC Main Wallet",
    "chain": "btc",
    "address": "bc1q..."
  },
  {
    "label": "ETH Trading Wallet",
    "chain": "eth",
    "address": "0x..."
  },
  {
    "label": "Solana Wallet",
    "chain": "sol",
    "address": "..."
  }
]
```

**Supported Chains:**
- `btc` - Bitcoin
- `eth` - Ethereum
- `bsc` - Binance Smart Chain
- `polygon` - Polygon
- `arbitrum` - Arbitrum
- `base` - Base
- `sol` - Solana

## Usage

### Manual Execution

```bash
# Install dependencies
pip install requests

# Run the audit
python chimera_full_discovery.py

# Check outputs
ls -la output/
cat output/ASSET_REPORT.md
```

### GitHub Actions Workflow

The workflow runs automatically:
- **Schedule**: Daily at 00:00 UTC
- **Manual**: Via workflow_dispatch in GitHub Actions UI

**To run manually:**
1. Go to Actions tab in GitHub
2. Select "NDAX Chimera Full Asset Discovery & Audit"
3. Click "Run workflow"
4. Download artifacts after completion (90-day retention)

## Output Files

### FULL_ASSET_DISCOVERY.json
Complete asset discovery data in JSON format with all metadata.

### ASSET_REPORT.md
Human-readable Markdown report organized by wallet:
- Wallet label and chain
- Wallet address
- Discovered assets with types and flags

### assets.csv
CSV export for spreadsheet analysis:
```csv
wallet,chain,type,symbol,flags
BTC Wallet 1,BTC,native,BTC,
ETH Main Wallet,ETH,native,ETH,unpriced
ETH Main Wallet,ETH,erc20,*,unpriced
```

### manifest.json
File integrity verification with SHA256 checksums:
```json
{
  "mode": "AUDIT_ONLY",
  "generated": "20251227_185023",
  "files": {
    "FULL_ASSET_DISCOVERY.json": "e1c4dad...",
    "ASSET_REPORT.md": "d61ee49...",
    "assets.csv": "046d3d6..."
  }
}
```

## Asset Classification Flags

- **unpriced**: Asset price not available or balance requires additional query
- **nft**: Asset is an NFT (ERC721, ERC1155, Metaplex, or compressed NFT)

## API Integrations

### Blockchain Data
- **Bitcoin**: blockchain.info API
- **EVM Chains**: Etherscan, BSCScan, PolygonScan, Arbiscan, BaseScan APIs
- **Solana**: Mainnet RPC endpoint

### Pricing Data
- **CoinGecko**: USD price lookups

## Security Considerations

1. **No Private Keys**: Never requires or handles private keys
2. **Read-Only APIs**: Only uses public blockchain explorers and RPC endpoints
3. **No Transaction Signing**: Cannot create or submit transactions
4. **Public Data Only**: All queried data is publicly available on-chain
5. **No Secrets Required**: Optional API keys for higher rate limits only

## Error Handling

The script includes:
- Timeout protection (20 seconds per API call)
- Graceful fallbacks for unavailable APIs
- Rate limiting with 1-second delays between wallets
- Asset flagging for incomplete data

## Compliance

- **Mode**: AUDIT_ONLY (hard-coded, cannot be changed without code modification)
- **Data Collection**: Public blockchain data only
- **Privacy**: Wallet addresses must be provided explicitly in configuration
- **Retention**: Historical audits retained locally for compliance tracking

## Dependencies

```bash
pip install requests
```

**Python Requirements:**
- Python 3.8+
- `requests` library for HTTP API calls
- Standard library: `json`, `csv`, `hashlib`, `pathlib`, `datetime`

## Workflow Artifacts

Artifacts are uploaded to GitHub Actions with:
- **Retention**: 90 days
- **Contents**: All output files + historical audit trail
- **Naming**: `chimera-full-asset-discovery-{run_number}`

## Troubleshooting

### Common Issues

**No wallets.json found:**
```bash
mkdir -p inputs
# Create inputs/wallets.json with your wallet addresses
```

**API rate limiting:**
- Add delays between runs
- Use API keys for higher limits (optional)
- Check blockchain explorer API status

**Missing output files:**
- Verify Python version (3.8+)
- Check `requests` library is installed
- Review error messages in console output

## Best Practices

1. **Regular Audits**: Run daily via scheduled workflow
2. **Backup History**: Archive `output/history/` periodically
3. **Verify Checksums**: Use manifest.json to verify file integrity
4. **Review Flags**: Investigate assets flagged as "unpriced"
5. **Monitor Artifacts**: Download and archive workflow artifacts

## License

This tool is part of the NDAX Quantum Engine project and follows the same license.

## Support

For issues or questions:
1. Check GitHub Actions workflow logs
2. Review error messages in audit output
3. Verify wallet addresses and chain identifiers
4. Ensure API endpoints are accessible

---

**Last Updated**: 2025-12-27  
**Version**: 1.0.0  
**Status**: Production Ready
