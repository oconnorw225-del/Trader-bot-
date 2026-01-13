# Forensic Fund Flow Analysis System

## Overview

The Forensic Fund Flow Analysis System is a comprehensive, read-only auditing tool designed to analyze cryptocurrency wallet activities and fund flows across multiple blockchain networks. This system operates in a strictly audit-only mode, ensuring no modifications or transactions are made.

## Key Features

- ✅ **Read-Only Operations**: All blockchain queries are read-only
- ✅ **No Transaction Capabilities**: No signing or broadcasting of transactions
- ✅ **Multi-Chain Support**: BTC, ETH, TRON, BSC, MATIC
- ✅ **Automated Workflow**: GitHub Actions integration for scheduled scans
- ✅ **Comprehensive Reporting**: JSON and CSV output formats
- ✅ **Audit Trail**: Complete logging of all operations
- ✅ **Safety Verified**: Built-in safety constraint checks

## System Components

### 1. Configuration (`ops/forensic_scan.yaml`)

Comprehensive YAML configuration defining:
- Audit-only mode and read-only permissions
- Supported blockchain networks
- Scan scope and parameters
- Rate limiting and error handling
- Output formats and reporting options

### 2. Chimera Coordinator (`bots/chimera.py`)

Main orchestration script that coordinates all forensic operations:
- CLI interface with safety flags (`--no-sign`, `--no-send`)
- Safety constraint verification
- Multi-phase coordination
- Result aggregation and reporting

**Usage:**
```bash
python3 bots/chimera.py \
  --mode audit_only \
  --role coordinator \
  --sync \
  --no-sign \
  --no-send \
  --chains BTC,ETH,TRON
```

### 3. Wallet Enumeration (`ops/enumerate_wallets.py`)

Discovers and catalogs all accessible cryptocurrency wallets:
- Read-only wallet discovery
- Multi-chain support
- JSON output format
- No private key access

**Usage:**
```bash
python3 ops/enumerate_wallets.py \
  --audit-only \
  --chains BTC,ETH,TRON \
  --output results/forensic/wallet_inventory.json
```

### 4. Outbound Transfer Scanner (`ops/scan_outbound.py`)

Scans blockchain networks for outbound transactions:
- Historical transaction analysis
- Multi-chain scanning
- Configurable transaction limits
- Detailed transaction metadata

**Usage:**
```bash
python3 ops/scan_outbound.py \
  --wallets results/forensic/wallet_inventory.json \
  --chains BTC,ETH,TRON \
  --output results/forensic/outbound_transfers.json
```

### 5. Report Generator (`ops/generate_report.py`)

Generates comprehensive forensic reports:
- JSON format for machine processing
- CSV format for human analysis
- Summary statistics
- Fund flow analysis
- High-frequency wallet identification
- Large transfer detection

**Usage:**
```bash
python3 ops/generate_report.py \
  --wallet-inventory results/forensic/wallet_inventory.json \
  --scan-results results/forensic/outbound_transfers.json \
  --output-json results/forensic/forensic_report.json \
  --output-csv results/forensic/forensic_report.csv
```

### 6. GitHub Actions Workflow (`.github/workflows/forensic-scan.yml`)

Automated workflow for scheduled or manual execution:
- Manual dispatch with configurable options
- Scheduled daily execution at midnight UTC
- Automatic trigger on configuration changes
- Artifact preservation (90 days)
- Complete audit logging

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Git

### Setup

1. Clone the repository:
```bash
git clone https://github.com/oconnorw225-del/Trader-bot-.git
cd Trader-bot-
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

Required packages:
- `pyyaml>=6.0.1`
- `requests>=2.31.0`
- `python-dotenv>=1.0.0`

3. Create necessary directories:
```bash
mkdir -p results/forensic logs
```

## Usage

### Manual Execution

#### Option 1: Full Workflow via Chimera Coordinator

```bash
python3 bots/chimera.py \
  --mode audit_only \
  --role coordinator \
  --sync \
  --no-sign \
  --no-send \
  --chains BTC,ETH,TRON \
  --verbose
```

#### Option 2: Step-by-Step Execution

```bash
# Step 1: Enumerate wallets
python3 ops/enumerate_wallets.py \
  --audit-only \
  --chains BTC,ETH,TRON \
  --output results/forensic/wallet_inventory.json

# Step 2: Scan outbound transfers
python3 ops/scan_outbound.py \
  --wallets results/forensic/wallet_inventory.json \
  --chains BTC,ETH,TRON \
  --output results/forensic/outbound_transfers.json

# Step 3: Generate reports
python3 ops/generate_report.py \
  --wallet-inventory results/forensic/wallet_inventory.json \
  --scan-results results/forensic/outbound_transfers.json \
  --output-json results/forensic/forensic_report.json \
  --output-csv results/forensic/forensic_report.csv
```

### GitHub Actions Workflow

#### Manual Trigger

1. Navigate to the GitHub repository
2. Go to **Actions** tab
3. Select **Chimera Forensic Synchronization Action**
4. Click **Run workflow**
5. Configure options:
   - **chains**: Comma-separated list (e.g., `BTC,ETH,TRON`)
   - **verbose**: Enable detailed logging
6. Click **Run workflow** button

#### Scheduled Execution

The workflow runs automatically daily at midnight UTC. No action required.

#### View Results

1. Go to **Actions** tab
2. Click on the completed workflow run
3. Scroll to **Artifacts** section
4. Download `forensic-analysis-reports-{run_number}`

## Output Files

### Wallet Inventory (`wallet_inventory.json`)

```json
{
  "operation": "wallet_enumeration",
  "mode": "audit_only",
  "timestamp": "2026-01-13T07:20:24.161Z",
  "chains": ["BTC", "ETH", "TRON"],
  "summary": {
    "total_wallets": 5,
    "chains_scanned": 3,
    "wallets_by_chain": {
      "BTC": 2,
      "ETH": 1,
      "TRON": 1
    }
  },
  "wallets": { ... }
}
```

### Outbound Transfers (`outbound_transfers.json`)

```json
{
  "operation": "outbound_scan",
  "timestamp": "2026-01-13T07:20:31.069Z",
  "summary": {
    "total_wallets": 5,
    "total_transactions": 23,
    "chains_scanned": 3
  },
  "scans": [ ... ]
}
```

### Forensic Report (`forensic_report.json`)

```json
{
  "report_type": "forensic_fund_flow_analysis",
  "generated_at": "2026-01-13T07:20:37.808Z",
  "summary": {
    "overview": {
      "total_wallets": 5,
      "total_transactions": 23,
      "chains_analyzed": 3,
      "avg_transactions_per_wallet": 4.6
    }
  },
  "analysis": {
    "volume_analysis": { ... },
    "recipient_analysis": { ... },
    "patterns": { ... }
  }
}
```

### Transaction Report (`forensic_report.csv`)

CSV format with columns:
- `chain`: Blockchain network
- `wallet`: Source wallet address
- `hash`: Transaction hash
- `timestamp`: Transaction timestamp
- `from`: Sender address
- `to`: Recipient address
- `amount`: Transfer amount
- `currency`: Currency/token
- `fee`: Transaction fee
- `status`: Transaction status
- `block_number`: Block number
- `confirmations`: Number of confirmations

## Safety Features

### Built-in Safety Constraints

1. **Mode Verification**: Ensures `audit_only` mode is active
2. **Permission Checks**: Verifies write/sign/send permissions are disabled
3. **Configuration Validation**: Validates forensic_scan.yaml before execution
4. **Read-Only APIs**: Only uses read-only blockchain queries
5. **No Private Keys**: Never accesses or requires private keys

### Safety Guarantees

- ❌ **No transaction signing**
- ❌ **No transaction broadcasting**
- ❌ **No wallet modifications**
- ❌ **No private key usage**
- ✅ **Read-only blockchain queries**
- ✅ **Audit trail logging**
- ✅ **Error handling and recovery**

## Configuration

### Supported Chains

- **BTC**: Bitcoin mainnet
- **ETH**: Ethereum mainnet
- **TRON**: TRON mainnet
- **BSC**: Binance Smart Chain
- **MATIC**: Polygon

### Configuration Options

Edit `ops/forensic_scan.yaml` to customize:
- Blockchain networks to scan
- Transaction filters (min value, max count)
- Rate limiting parameters
- Output formats and locations
- Time range for historical analysis

## Troubleshooting

### Common Issues

#### 1. "Configuration file not found"
**Solution**: Ensure `ops/forensic_scan.yaml` exists in the repository root.

#### 2. "SAFETY VIOLATION: Write permissions enabled"
**Solution**: Check `ops/forensic_scan.yaml` and ensure:
```yaml
permissions:
  read: true
  write: false
  sign: false
  send: false
```

#### 3. "Module not found: yaml"
**Solution**: Install PyYAML:
```bash
pip install pyyaml
```

#### 4. Empty scan results
**Solution**: This is expected behavior for the mock implementation. In production, connect to actual blockchain APIs.

### Logs

Check log files in the `logs/` directory:
- `chimera_coordinator.log`
- `enumerate_wallets.log`
- `scan_outbound.log`
- `generate_report.log`

## Development

### Adding New Chains

1. Update `ops/forensic_scan.yaml`:
```yaml
chains:
  - BTC
  - ETH
  - TRON
  - YOUR_CHAIN  # Add here
```

2. Update wallet enumeration logic in `ops/enumerate_wallets.py`
3. Update scanning logic in `ops/scan_outbound.py`
4. Test thoroughly

### Extending Functionality

The system is designed for extensibility:
- Add new analysis patterns in `ops/generate_report.py`
- Implement real blockchain API integrations
- Add custom filters and transformations
- Extend reporting capabilities

## Security Considerations

- ✅ Never commit private keys or sensitive data
- ✅ Use environment variables for API keys
- ✅ Run in isolated environments
- ✅ Review logs for suspicious activity
- ✅ Validate all configuration changes
- ✅ Keep dependencies updated

## License

This system is part of the NDAX Quantum Engine project. See main repository LICENSE for details.

## Support

For issues or questions:
1. Check existing GitHub Issues
2. Review documentation in `/docs`
3. Create a new issue with:
   - Description of the problem
   - Steps to reproduce
   - Log files (sanitized)
   - Expected vs actual behavior

## Changelog

### Version 1.0.0 (2026-01-13)

- ✅ Initial release
- ✅ Multi-chain wallet enumeration
- ✅ Outbound transfer scanning
- ✅ JSON and CSV report generation
- ✅ GitHub Actions workflow integration
- ✅ Chimera coordinator orchestration
- ✅ Safety constraint verification
- ✅ Comprehensive logging and audit trail
