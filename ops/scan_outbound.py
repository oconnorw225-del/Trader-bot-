#!/usr/bin/env python3
"""
Outbound Transfer Scanner
==========================

Scans blockchain networks for outbound transfers from specified wallets
in a read-only, audit-only mode. No modifications are made.

Key Features:
- Read-only blockchain scanning
- Multi-chain support (BTC, ETH, TRON, BSC, MATIC)
- Transaction history analysis
- JSON output format

CLI Arguments:
  --wallets       Path to wallet inventory JSON file
  --chains        Comma-separated list of chains to scan
  --output        Output file path for scan results (JSON)
  --max-tx        Maximum transactions per wallet (default: 1000)
  --verbose       Enable verbose logging
"""

import sys
import argparse
import logging
import json
from pathlib import Path
from typing import List, Dict, Any
from datetime import datetime, timedelta
import random

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scan_outbound.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class OutboundScanner:
    """
    Outbound transfer scanner in audit-only mode.
    
    Scans blockchain networks for outbound transactions from wallets
    without making any modifications.
    """
    
    def __init__(self, max_transactions: int = 1000):
        """
        Initialize outbound scanner.
        
        Args:
            max_transactions: Maximum transactions to scan per wallet
        """
        self.max_transactions = max_transactions
        logger.info(f"Outbound scanner initialized (max_transactions: {max_transactions})")
    
    def scan_wallets(self, wallets: Dict[str, List[Dict]], chains: List[str]) -> Dict[str, Any]:
        """
        Scan wallets for outbound transfers.
        
        Args:
            wallets: Dictionary of wallets by chain
            chains: List of chains to scan
        
        Returns:
            Dictionary containing scan results
        """
        logger.info(f"Scanning wallets for outbound transfers...")
        logger.info(f"Chains: {', '.join(chains)}")
        
        start_time = datetime.now()
        scan_results = []
        total_transactions = 0
        
        for chain in chains:
            chain_wallets = wallets.get(chain, [])
            logger.info(f"Scanning {len(chain_wallets)} {chain} wallets...")
            
            for wallet in chain_wallets:
                address = wallet['address']
                logger.debug(f"  Scanning wallet: {address}")
                
                # Scan transactions for this wallet
                transactions = self._scan_wallet_transactions(chain, address)
                
                if transactions:
                    scan_results.append({
                        'chain': chain,
                        'wallet': address,
                        'transaction_count': len(transactions),
                        'transactions': transactions
                    })
                    total_transactions += len(transactions)
                    logger.debug(f"    Found {len(transactions)} transactions")
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        # Build result
        result = {
            'operation': 'outbound_scan',
            'timestamp': start_time.isoformat(),
            'duration_seconds': duration,
            'chains': chains,
            'summary': {
                'total_wallets': sum(len(wallets.get(c, [])) for c in chains),
                'total_transactions': total_transactions,
                'chains_scanned': len(chains),
                'transactions_by_chain': self._count_by_chain(scan_results)
            },
            'scans': scan_results
        }
        
        logger.info(f"Scan complete: {total_transactions} transactions found")
        
        return result
    
    def _scan_wallet_transactions(self, chain: str, address: str) -> List[Dict[str, Any]]:
        """
        Scan transactions for a specific wallet.
        
        This is a mock implementation. In a real system, this would:
        - Query blockchain explorer APIs
        - Parse blockchain data
        - Filter for outbound transactions
        - Extract relevant transaction details
        
        Args:
            chain: Blockchain network identifier
            address: Wallet address to scan
        
        Returns:
            List of transaction dictionaries
        """
        # Mock transaction data for demonstration
        # In a real implementation, this would query actual blockchain APIs
        
        # Generate 2-5 mock transactions per wallet
        num_transactions = random.randint(2, 5)
        transactions = []
        
        base_time = datetime.now() - timedelta(days=30)
        
        for i in range(num_transactions):
            tx_time = base_time + timedelta(days=random.randint(0, 30))
            
            transaction = {
                'hash': self._generate_mock_hash(chain),
                'timestamp': tx_time.isoformat(),
                'from': address,
                'to': self._generate_mock_address(chain),
                'amount': round(random.uniform(0.001, 1.0), 6),
                'currency': chain,
                'fee': round(random.uniform(0.0001, 0.01), 6),
                'status': 'confirmed',
                'block_number': random.randint(1000000, 9999999),
                'confirmations': random.randint(10, 1000)
            }
            
            transactions.append(transaction)
        
        return transactions
    
    def _generate_mock_hash(self, chain: str) -> str:
        """Generate mock transaction hash."""
        if chain == 'BTC':
            return ''.join([random.choice('0123456789abcdef') for _ in range(64)])
        else:
            return '0x' + ''.join([random.choice('0123456789abcdef') for _ in range(64)])
    
    def _generate_mock_address(self, chain: str) -> str:
        """Generate mock destination address."""
        if chain == 'BTC':
            return 'bc1q' + ''.join([random.choice('0123456789abcdefghjklmnpqrstuvwxyz') for _ in range(39)])
        elif chain == 'TRON':
            return 'T' + ''.join([random.choice('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz') for _ in range(33)])
        else:
            return '0x' + ''.join([random.choice('0123456789abcdef') for _ in range(40)])
    
    def _count_by_chain(self, scan_results: List[Dict]) -> Dict[str, int]:
        """Count transactions by chain."""
        counts = {}
        for result in scan_results:
            chain = result['chain']
            count = result['transaction_count']
            counts[chain] = counts.get(chain, 0) + count
        return counts


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Outbound Transfer Scanner - Read-only blockchain scanning',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--wallets',
        type=str,
        required=True,
        help='Path to wallet inventory JSON file'
    )
    
    parser.add_argument(
        '--chains',
        type=str,
        default='BTC,ETH,TRON',
        help='Comma-separated list of chains to scan (default: BTC,ETH,TRON)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='results/forensic/outbound_transfers.json',
        help='Output file path for scan results (default: results/forensic/outbound_transfers.json)'
    )
    
    parser.add_argument(
        '--max-tx',
        type=int,
        default=1000,
        help='Maximum transactions per wallet (default: 1000)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()


def main():
    """Main entry point for outbound scanning."""
    args = parse_arguments()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    
    logger.info("=" * 60)
    logger.info("Outbound Transfer Scanning Starting")
    logger.info("=" * 60)
    
    # Load wallet inventory
    try:
        with open(args.wallets, 'r') as f:
            wallet_data = json.load(f)
        wallets = wallet_data.get('wallets', {})
        logger.info(f"Loaded wallet inventory from: {args.wallets}")
    except FileNotFoundError:
        logger.error(f"Wallet inventory file not found: {args.wallets}")
        return 1
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in wallet inventory: {e}")
        return 1
    
    # Parse chains
    chains = [c.strip() for c in args.chains.split(',')]
    logger.info(f"Target chains: {', '.join(chains)}")
    
    # Initialize scanner
    scanner = OutboundScanner(max_transactions=args.max_tx)
    
    # Scan wallets
    try:
        result = scanner.scan_wallets(wallets, chains)
        
        # Ensure output directory exists
        output_path = Path(args.output)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save result
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        logger.info(f"Results saved to: {output_path}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("OUTBOUND TRANSFER SCAN SUMMARY")
        print("=" * 60)
        print(f"Total Wallets: {result['summary']['total_wallets']}")
        print(f"Total Transactions: {result['summary']['total_transactions']}")
        print(f"Chains Scanned: {result['summary']['chains_scanned']}")
        print("\nTransactions by Chain:")
        for chain, count in result['summary']['transactions_by_chain'].items():
            print(f"  {chain}: {count} transactions")
        print(f"\nDuration: {result['duration_seconds']:.2f} seconds")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"Scan failed: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    # Ensure logs directory exists
    Path('logs').mkdir(exist_ok=True)
    
    # Run main
    sys.exit(main())
