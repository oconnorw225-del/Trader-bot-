#!/usr/bin/env python3
"""
Chimera Coordinator - Forensic Scanning Orchestrator
====================================================

This coordinator script manages forensic scanning operations across multiple
blockchain networks. It orchestrates wallet enumeration, transaction scanning,
and report generation in a read-only, audit-only mode.

Key Features:
- Multi-chain coordination (BTC, ETH, TRON, BSC, MATIC)
- Read-only operations (no signing or sending)
- Audit trail and comprehensive logging
- Synchronous execution with error handling

CLI Arguments:
  --mode        Execution mode (audit_only, forensic, etc.)
  --role        Role in operation (coordinator, scanner, reporter)
  --sync        Enable synchronous execution (wait for completion)
  --no-sign     Disable transaction signing
  --no-send     Disable transaction broadcasting
  --config      Path to configuration file
  --output      Output directory for reports
  --chains      Comma-separated list of chains to scan
  --verbose     Enable verbose logging
"""

import sys
import argparse
import logging
import json
import yaml
from pathlib import Path
from typing import Dict, List, Any, Optional
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/chimera_coordinator.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ChimeraCoordinator:
    """
    Chimera Coordinator for forensic scanning operations.
    
    Orchestrates multi-chain wallet analysis and fund flow tracking
    in a strictly read-only, audit-only mode.
    """
    
    def __init__(self, config_path: str, mode: str, role: str):
        """
        Initialize coordinator with configuration.
        
        Args:
            config_path: Path to forensic_scan.yaml configuration
            mode: Execution mode (audit_only, forensic, etc.)
            role: Role in operation (coordinator, scanner, reporter)
        """
        self.config_path = Path(config_path)
        self.mode = mode
        self.role = role
        self.config = self._load_config()
        self.start_time = datetime.now()
        
        logger.info(f"Chimera Coordinator initialized")
        logger.info(f"  Mode: {self.mode}")
        logger.info(f"  Role: {self.role}")
        logger.info(f"  Config: {self.config_path}")
        
        # Safety checks
        self._verify_safety_constraints()
    
    def _load_config(self) -> Dict[str, Any]:
        """Load configuration from YAML file."""
        try:
            with open(self.config_path, 'r') as f:
                config = yaml.safe_load(f)
            logger.info(f"Loaded configuration from {self.config_path}")
            return config
        except FileNotFoundError:
            logger.error(f"Configuration file not found: {self.config_path}")
            sys.exit(1)
        except yaml.YAMLError as e:
            logger.error(f"Error parsing configuration: {e}")
            sys.exit(1)
    
    def _verify_safety_constraints(self):
        """Verify that all safety constraints are met."""
        logger.info("Verifying safety constraints...")
        
        # Check mode
        if self.config.get('mode') != 'audit_only' and self.mode != 'audit_only':
            logger.warning(f"Mode '{self.mode}' is not audit_only - proceeding with caution")
        
        # Check permissions
        permissions = self.config.get('permissions', {})
        if permissions.get('write', False):
            logger.error("SAFETY VIOLATION: Write permissions enabled")
            raise ValueError("Write permissions must be disabled for forensic scanning")
        
        if permissions.get('sign', False):
            logger.error("SAFETY VIOLATION: Sign permissions enabled")
            raise ValueError("Sign permissions must be disabled for forensic scanning")
        
        if permissions.get('send', False):
            logger.error("SAFETY VIOLATION: Send permissions enabled")
            raise ValueError("Send permissions must be disabled for forensic scanning")
        
        logger.info("✅ All safety constraints verified")
    
    def coordinate_scan(self, chains: Optional[List[str]] = None) -> Dict[str, Any]:
        """
        Coordinate forensic scanning across specified chains.
        
        Args:
            chains: List of blockchain networks to scan. If None, uses config.
        
        Returns:
            Dictionary with scan results and summary
        """
        logger.info("=" * 60)
        logger.info("Starting Chimera Forensic Scan Coordination")
        logger.info("=" * 60)
        
        # Determine chains to scan
        target_chains = chains or self.config.get('chains', [])
        logger.info(f"Target chains: {', '.join(target_chains)}")
        
        results = {
            'coordinator': 'chimera',
            'mode': self.mode,
            'role': self.role,
            'start_time': self.start_time.isoformat(),
            'chains': target_chains,
            'operations': [],
            'summary': {}
        }
        
        # Phase 1: Wallet Enumeration
        logger.info("\n🔍 Phase 1: Wallet Enumeration")
        enumeration_result = self._coordinate_enumeration()
        results['operations'].append(enumeration_result)
        
        # Phase 2: Outbound Transfer Scanning
        logger.info("\n📊 Phase 2: Outbound Transfer Scanning")
        scan_result = self._coordinate_scanning(target_chains, enumeration_result)
        results['operations'].append(scan_result)
        
        # Phase 3: Report Generation
        logger.info("\n📝 Phase 3: Report Generation")
        report_result = self._coordinate_reporting()
        results['operations'].append(report_result)
        
        # Generate summary
        results['end_time'] = datetime.now().isoformat()
        results['duration_seconds'] = (datetime.now() - self.start_time).total_seconds()
        results['summary'] = self._generate_summary(results)
        
        logger.info("=" * 60)
        logger.info("Forensic Scan Coordination Complete")
        logger.info("=" * 60)
        logger.info(f"Duration: {results['duration_seconds']:.2f} seconds")
        logger.info(f"Status: {results['summary'].get('overall_status', 'unknown')}")
        
        return results
    
    def _coordinate_enumeration(self) -> Dict[str, Any]:
        """Coordinate wallet enumeration phase."""
        logger.info("Coordinating wallet enumeration...")
        
        # In a real implementation, this would call ops/enumerate_wallets.py
        # For now, return a mock coordination result
        return {
            'phase': 'enumeration',
            'status': 'coordinated',
            'timestamp': datetime.now().isoformat(),
            'message': 'Wallet enumeration coordinated successfully'
        }
    
    def _coordinate_scanning(self, chains: List[str], enumeration_result: Dict) -> Dict[str, Any]:
        """Coordinate blockchain scanning phase."""
        logger.info(f"Coordinating scanning for {len(chains)} chains...")
        
        # In a real implementation, this would call ops/scan_outbound.py
        return {
            'phase': 'scanning',
            'status': 'coordinated',
            'chains': chains,
            'timestamp': datetime.now().isoformat(),
            'message': f'Scanning coordinated for {len(chains)} chains'
        }
    
    def _coordinate_reporting(self) -> Dict[str, Any]:
        """Coordinate report generation phase."""
        logger.info("Coordinating report generation...")
        
        # In a real implementation, this would call ops/generate_report.py
        return {
            'phase': 'reporting',
            'status': 'coordinated',
            'timestamp': datetime.now().isoformat(),
            'message': 'Report generation coordinated successfully'
        }
    
    def _generate_summary(self, results: Dict[str, Any]) -> Dict[str, Any]:
        """Generate summary of coordination results."""
        successful_phases = sum(
            1 for op in results['operations'] 
            if op.get('status') == 'coordinated'
        )
        
        return {
            'overall_status': 'success' if successful_phases == len(results['operations']) else 'partial',
            'total_phases': len(results['operations']),
            'successful_phases': successful_phases,
            'failed_phases': len(results['operations']) - successful_phases,
            'total_chains': len(results['chains']),
            'mode': results['mode'],
            'role': results['role']
        }


def parse_arguments() -> argparse.Namespace:
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description='Chimera Coordinator - Forensic Scanning Orchestrator',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Run forensic scan in audit-only mode
  python chimera.py --mode audit_only --role coordinator
  
  # Scan specific chains with verbose logging
  python chimera.py --mode audit_only --chains BTC,ETH --verbose
  
  # Generate reports with custom output directory
  python chimera.py --mode audit_only --output results/custom --sync
        """
    )
    
    parser.add_argument(
        '--mode',
        type=str,
        default='audit_only',
        choices=['audit_only', 'forensic', 'analysis'],
        help='Execution mode (default: audit_only)'
    )
    
    parser.add_argument(
        '--role',
        type=str,
        default='coordinator',
        choices=['coordinator', 'scanner', 'reporter'],
        help='Role in operation (default: coordinator)'
    )
    
    parser.add_argument(
        '--sync',
        action='store_true',
        help='Enable synchronous execution (wait for completion)'
    )
    
    parser.add_argument(
        '--no-sign',
        action='store_true',
        help='Disable transaction signing (recommended for forensic mode)'
    )
    
    parser.add_argument(
        '--no-send',
        action='store_true',
        help='Disable transaction broadcasting (recommended for forensic mode)'
    )
    
    parser.add_argument(
        '--config',
        type=str,
        default='ops/forensic_scan.yaml',
        help='Path to configuration file (default: ops/forensic_scan.yaml)'
    )
    
    parser.add_argument(
        '--output',
        type=str,
        default='results/forensic',
        help='Output directory for reports (default: results/forensic)'
    )
    
    parser.add_argument(
        '--chains',
        type=str,
        default=None,
        help='Comma-separated list of chains to scan (e.g., BTC,ETH,TRON)'
    )
    
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Enable verbose logging'
    )
    
    return parser.parse_args()


def main():
    """Main entry point for Chimera Coordinator."""
    args = parse_arguments()
    
    # Set logging level
    if args.verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    
    # Create output directory
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Output directory: {output_dir}")
    
    # Log arguments
    logger.info(f"Arguments: {vars(args)}")
    
    # Safety warnings
    if not args.no_sign:
        logger.warning("⚠️  Transaction signing is not explicitly disabled. Use --no-sign for forensic mode.")
    
    if not args.no_send:
        logger.warning("⚠️  Transaction broadcasting is not explicitly disabled. Use --no-send for forensic mode.")
    
    # Initialize coordinator
    try:
        coordinator = ChimeraCoordinator(
            config_path=args.config,
            mode=args.mode,
            role=args.role
        )
    except Exception as e:
        logger.error(f"Failed to initialize coordinator: {e}")
        return 1
    
    # Parse chains if provided
    chains = args.chains.split(',') if args.chains else None
    
    # Run coordination
    try:
        results = coordinator.coordinate_scan(chains=chains)
        
        # Save results
        output_file = output_dir / f"coordination_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2)
        
        logger.info(f"Results saved to: {output_file}")
        
        # Print summary
        print("\n" + "=" * 60)
        print("FORENSIC SCAN COORDINATION SUMMARY")
        print("=" * 60)
        summary = results['summary']
        print(f"Status: {summary['overall_status'].upper()}")
        print(f"Mode: {summary['mode']}")
        print(f"Role: {summary['role']}")
        print(f"Phases: {summary['successful_phases']}/{summary['total_phases']} successful")
        print(f"Chains: {summary['total_chains']}")
        print(f"Duration: {results['duration_seconds']:.2f} seconds")
        print("=" * 60)
        
        return 0 if summary['overall_status'] == 'success' else 1
        
    except Exception as e:
        logger.error(f"Coordination failed: {e}", exc_info=True)
        return 1


if __name__ == '__main__':
    # Ensure logs directory exists
    Path('logs').mkdir(exist_ok=True)
    
    # Run main
    sys.exit(main())
