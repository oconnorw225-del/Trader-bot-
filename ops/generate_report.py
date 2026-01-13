#!/usr/bin/env python3
"""
Forensic Report Generator
==========================

Generates comprehensive forensic reports from scan results in both
JSON and CSV formats. Includes summary statistics and analysis.

Key Features:
- JSON report generation
- CSV report generation
- Summary statistics
- Fund flow analysis
- Multiple input file support

CLI Arguments:
  --wallet-inventory    Path to wallet inventory JSON file
  --scan-results        Path to scan results JSON file
  --output-json         Output path for JSON report
  --output-csv          Output path for CSV report
  --verbose             Enable verbose logging
"""

import sys
import argparse
import logging
import json
import csv
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/generate_report.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ForensicReportGenerator:
    """
    Forensic report generator for fund flow analysis.
    
    Processes scan results and generates comprehensive reports
    in multiple formats.
    """
    
    def __init__(self):
        """Initialize report generator."""
        logger.info("Forensic report generator initialized")
    
    def generate_reports(
        self,
        wallet_inventory: Dict[str, Any],
        scan_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate comprehensive forensic reports.
        
        Args:
            wallet_inventory: Wallet enumeration results
            scan_results: Outbound transfer scan results
        
        Returns:
            Dictionary containing report data
        """
        logger.info("Generating forensic reports...")
        
        start_time = datetime.now()
        
        # Generate summary statistics
        summary = self._generate_summary(wallet_inventory, scan_results)
        
        # Generate detailed analysis
        analysis = self._generate_analysis(scan_results)
        
        # Build comprehensive report
        report = {
            'report_type': 'forensic_fund_flow_analysis',
            'generated_at': start_time.isoformat(),
            'summary': summary,
            'analysis': analysis,
            'wallet_inventory': wallet_inventory,
            'scan_results': scan_results
        }
        
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        logger.info(f"Report generation complete ({duration:.2f} seconds)")
        
        return report
    
    def _generate_summary(
        self,
        wallet_inventory: Dict[str, Any],
        scan_results: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Generate summary statistics."""
        logger.debug("Generating summary statistics...")
        
        wallet_summary = wallet_inventory.get('summary', {})
        scan_summary = scan_results.get('summary', {})
        
        # Calculate aggregate statistics
        total_wallets = wallet_summary.get('total_wallets', 0)
        total_transactions = scan_summary.get('total_transactions', 0)
        chains_analyzed = scan_summary.get('chains_scanned', 0)
        
        # Calculate totals by chain
        transactions_by_chain = scan_summary.get('transactions_by_chain', {})
        
        summary = {
            'overview': {
                'total_wallets': total_wallets,
                'total_transactions': total_transactions,
                'chains_analyzed': chains_analyzed,
                'avg_transactions_per_wallet': round(
                    total_transactions / total_wallets, 2
                ) if total_wallets > 0 else 0
            },
            'by_chain': transactions_by_chain,
            'data_sources': {
                'wallet_inventory': wallet_inventory.get('operation', 'unknown'),
                'scan_results': scan_results.get('operation', 'unknown')
            }
        }
        
        return summary
    
    def _generate_analysis(self, scan_results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate detailed fund flow analysis."""
        logger.debug("Generating fund flow analysis...")
        
        scans = scan_results.get('scans', [])
        
        # Analyze transaction patterns
        total_volume = 0.0
        total_fees = 0.0
        unique_recipients = set()
        transaction_count_by_status = {}
        
        for scan in scans:
            for tx in scan.get('transactions', []):
                # Volume analysis
                total_volume += tx.get('amount', 0)
                total_fees += tx.get('fee', 0)
                
                # Recipient analysis
                recipient = tx.get('to', '')
                if recipient:
                    unique_recipients.add(recipient)
                
                # Status analysis
                status = tx.get('status', 'unknown')
                transaction_count_by_status[status] = \
                    transaction_count_by_status.get(status, 0) + 1
        
        analysis = {
            'volume_analysis': {
                'total_volume': round(total_volume, 6),
                'total_fees': round(total_fees, 6),
                'net_outflow': round(total_volume + total_fees, 6)
            },
            'recipient_analysis': {
                'unique_recipients': len(unique_recipients),
                'sample_recipients': list(unique_recipients)[:10]
            },
            'transaction_status': transaction_count_by_status,
            'patterns': {
                'high_frequency_wallets': self._identify_high_frequency_wallets(scans),
                'large_transfers': self._identify_large_transfers(scans)
            }
        }
        
        return analysis
    
    def _identify_high_frequency_wallets(self, scans: List[Dict]) -> List[Dict]:
        """Identify wallets with high transaction frequency."""
        # Sort by transaction count
        sorted_scans = sorted(
            scans,
            key=lambda s: s.get('transaction_count', 0),
            reverse=True
        )
        
        # Return top 5
        return [
            {
                'wallet': s['wallet'],
                'chain': s['chain'],
                'transaction_count': s['transaction_count']
            }
            for s in sorted_scans[:5]
        ]
    
    def _identify_large_transfers(self, scans: List[Dict]) -> List[Dict]:
        """Identify large value transfers."""
        all_transactions = []
        
        for scan in scans:
            for tx in scan.get('transactions', []):
                all_transactions.append({
                    'wallet': scan['wallet'],
                    'chain': scan['chain'],
                    'hash': tx['hash'],
                    'amount': tx['amount'],
                    'to': tx['to']
                })
        
        # Sort by amount
        sorted_txs = sorted(
            all_transactions,
            key=lambda t: t['amount'],
            reverse=True
        )
        
        # Return top 10
        return sorted_txs[:10]
    
    def save_json_report(self, report: Dict[str, Any], output_path: str):
        """Save report in JSON format."""
        logger.info(f"Saving JSON report to: {output_path}")
        
        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info("✅ JSON report saved")
    
    def save_csv_report(self, report: Dict[str, Any], output_path: str):
        """Save report in CSV format."""
        logger.info(f"Saving CSV report to: {output_path}")
        
        output = Path(output_path)
        output.parent.mkdir(parents=True, exist_ok=True)
        
        # Extract transaction data for CSV
        transactions = []
        scan_results = report.get('scan_results', {})
        
        for scan in scan_results.get('scans', []):
            chain = scan['chain']
            wallet = scan['wallet']
            
            for tx in scan.get('transactions', []):
                transactions.append({
                    'chain': chain,
                    'wallet': wallet,
                    'hash': tx['hash'],
                    'timestamp': tx['timestamp'],
                    'from': tx['from'],
                    'to': tx['to'],
                    'amount': tx['amount'],
                    'currency': tx['currency'],
                    'fee': tx['fee'],
                    'status': tx['status'],
                    'block_number': tx['block_number'],
                    'confirmations': tx['confirmations']
                })
        
        # Write CSV
        if transactions:
            with open(output, 'w', newline='') as f:
                writer = csv.DictWriter(f, fieldnames=transactions[0].keys())
                writer.writeheader()
                writer.writerows(transactions)
            
            logger.info(f"✅ CSV report saved ({len(transactions)} transactions)")
        else:
            logger.warning("No transactions to write to CSV")


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Forensic Report Generator - Generate comprehensive fund flow reports',
        formatter_class=argparse.RawDescriptionHelpFormatter
    )
    
    parser.add_argument(
        '--wallet-inventory',
        type=str,
        required=True,
        help='Path to wallet inventory JSON file'
    )
    
    parser.add_argument(
        '--scan-results',
        type=str,
        required=True,
        help='Path to scan results JSON file'
    )
    
    parser.add_argument(
        '--output-json',
        type=str,
        default='results/forensic/forensic_report.json',
        help='Output path for JSON report (default: results/forensic/forensic_report.json)'
    )
    
    parser.add_argument(
        '--output-csv',
        type=str,
        default='results/forensic/forensic_report.csv',
        help='Output path for CSV report (default: results/forensic/forensic_report.csv)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()


def main():
    """Main entry point for report generation."""
    args = parse_arguments()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    
    logger.info("=" * 60)
    logger.info("Forensic Report Generation Starting")
    logger.info("=" * 60)
    
    # Load wallet inventory
    try:
        with open(args.wallet_inventory, 'r') as f:
            wallet_inventory = json.load(f)
        logger.info(f"Loaded wallet inventory from: {args.wallet_inventory}")
    except FileNotFoundError:
        logger.error(f"Wallet inventory file not found: {args.wallet_inventory}")
        return 1
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in wallet inventory: {e}")
        return 1
    
    # Load scan results
    try:
        with open(args.scan_results, 'r') as f:
            scan_results = json.load(f)
        logger.info(f"Loaded scan results from: {args.scan_results}")
    except FileNotFoundError:
        logger.error(f"Scan results file not found: {args.scan_results}")
        return 1
    except json.JSONDecodeError as e:
        logger.error(f"Invalid JSON in scan results: {e}")
        return 1
    
    # Initialize generator
    generator = ForensicReportGenerator()
    
    # Generate reports
    try:
        report = generator.generate_reports(wallet_inventory, scan_results)
        
        # Save reports
        generator.save_json_report(report, args.output_json)
        generator.save_csv_report(report, args.output_csv)
        
        # Print summary
        print("\n" + "=" * 60)
        print("FORENSIC REPORT GENERATION SUMMARY")
        print("=" * 60)
        summary = report['summary']['overview']
        print(f"Total Wallets: {summary['total_wallets']}")
        print(f"Total Transactions: {summary['total_transactions']}")
        print(f"Chains Analyzed: {summary['chains_analyzed']}")
        print(f"Avg Transactions/Wallet: {summary['avg_transactions_per_wallet']}")
        print("\nReports Generated:")
        print(f"  JSON: {args.output_json}")
        print(f"  CSV: {args.output_csv}")
        print("=" * 60)
        
        return 0
        
    except Exception as e:
        logger.error(f"Report generation failed: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    # Ensure logs directory exists
    Path('logs').mkdir(exist_ok=True)
    
    # Run main
    sys.exit(main())
