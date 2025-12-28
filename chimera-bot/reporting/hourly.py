"""
CHIMERA-BOT Hourly Reporter
Generates trading reports and analytics
"""

import logging
import json
from typing import Dict, Any, List
from datetime import datetime, timedelta
from pathlib import Path

logger = logging.getLogger(__name__)


class HourlyReporter:
    """
    Hourly Reporter - generates periodic trading reports
    Tracks performance metrics and trading activity
    """
    
    def __init__(self, config):
        self.config = config
        
        # Report storage
        self.report_dir = Path("reports")
        self.report_dir.mkdir(exist_ok=True)
        
        # Trading records
        self.trades = []
        self.last_report_time = datetime.now()
        
        logger.info(f"Hourly Reporter initialized (interval: {config.reporting_interval}s)")
    
    def log_trade(self, execution: Dict[str, Any]):
        """
        Log a trade execution for reporting
        """
        trade_record = {
            'timestamp': datetime.now().isoformat(),
            'execution': execution
        }
        
        self.trades.append(trade_record)
        
        # Check if report is due
        if self._should_generate_report():
            self.generate_report()
    
    def generate_report(self) -> Dict[str, Any]:
        """
        Generate hourly trading report
        """
        logger.info("Generating hourly report")
        
        now = datetime.now()
        report_period_start = self.last_report_time
        report_period_end = now
        
        # Filter trades for this period
        period_trades = self._get_trades_in_period(report_period_start, report_period_end)
        
        # Calculate metrics
        report = {
            'report_type': 'hourly',
            'period_start': report_period_start.isoformat(),
            'period_end': report_period_end.isoformat(),
            'mode': self.config.mode.value,
            'risk_level': self.config.risk_level.value,
            'summary': self._calculate_summary(period_trades),
            'performance': self._calculate_performance(period_trades),
            'trades': period_trades,
            'generated_at': now.isoformat()
        }
        
        # Save report
        self._save_report(report)
        
        # Update last report time
        self.last_report_time = now
        
        logger.info(f"Report generated: {len(period_trades)} trades, "
                   f"P&L: ${report['summary']['total_pnl']:.2f}")
        
        return report
    
    def _should_generate_report(self) -> bool:
        """Check if it's time to generate a report"""
        elapsed = (datetime.now() - self.last_report_time).total_seconds()
        return elapsed >= self.config.reporting_interval
    
    def _get_trades_in_period(self, start: datetime, end: datetime) -> List[Dict[str, Any]]:
        """Get trades within a time period"""
        period_trades = []
        
        for trade in self.trades:
            trade_time = datetime.fromisoformat(trade['timestamp'])
            if start <= trade_time <= end:
                period_trades.append(trade)
        
        return period_trades
    
    def _calculate_summary(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate summary statistics"""
        total_trades = len(trades)
        successful_trades = sum(1 for t in trades if t['execution'].get('success', False))
        failed_trades = total_trades - successful_trades
        
        # Calculate P&L
        total_pnl = sum(
            t['execution'].get('result', {}).get('pnl', 0)
            for t in trades
        )
        
        return {
            'total_trades': total_trades,
            'successful_trades': successful_trades,
            'failed_trades': failed_trades,
            'success_rate': successful_trades / total_trades if total_trades > 0 else 0,
            'total_pnl': total_pnl
        }
    
    def _calculate_performance(self, trades: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calculate performance metrics"""
        if not trades:
            return {
                'avg_trade_pnl': 0,
                'max_profit': 0,
                'max_loss': 0,
                'win_rate': 0,
                'profit_factor': 0
            }
        
        # Extract P&L values
        pnl_values = [
            t['execution'].get('result', {}).get('pnl', 0)
            for t in trades
        ]
        
        winning_trades = [p for p in pnl_values if p > 0]
        losing_trades = [p for p in pnl_values if p < 0]
        
        total_profit = sum(winning_trades) if winning_trades else 0
        total_loss = abs(sum(losing_trades)) if losing_trades else 0
        
        return {
            'avg_trade_pnl': sum(pnl_values) / len(pnl_values),
            'max_profit': max(pnl_values) if pnl_values else 0,
            'max_loss': min(pnl_values) if pnl_values else 0,
            'win_rate': len(winning_trades) / len(trades) if trades else 0,
            'profit_factor': total_profit / total_loss if total_loss > 0 else float('inf')
        }
    
    def _save_report(self, report: Dict[str, Any]):
        """Save report to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = self.report_dir / f"report_{timestamp}.json"
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        logger.info(f"Report saved: {filename}")
        
        # Also save as latest
        latest_file = self.report_dir / "latest_report.json"
        with open(latest_file, 'w') as f:
            json.dump(report, f, indent=2)
    
    def get_daily_summary(self) -> Dict[str, Any]:
        """Get summary for the current day"""
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = datetime.now()
        
        today_trades = self._get_trades_in_period(today_start, today_end)
        
        return {
            'date': today_start.date().isoformat(),
            'summary': self._calculate_summary(today_trades),
            'performance': self._calculate_performance(today_trades)
        }
    
    def status(self) -> Dict[str, Any]:
        """Get reporter status"""
        time_until_next = self.config.reporting_interval - (
            datetime.now() - self.last_report_time
        ).total_seconds()
        
        return {
            'total_trades_logged': len(self.trades),
            'last_report_time': self.last_report_time.isoformat(),
            'next_report_in': max(0, time_until_next),
            'report_directory': str(self.report_dir)
        }
    
    def export_trades(self, format: str = 'json') -> str:
        """Export all trades to file"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == 'json':
            filename = self.report_dir / f"trades_export_{timestamp}.json"
            with open(filename, 'w') as f:
                json.dump(self.trades, f, indent=2)
        
        elif format == 'csv':
            import csv
            filename = self.report_dir / f"trades_export_{timestamp}.csv"
            
            with open(filename, 'w', newline='') as f:
                writer = csv.writer(f)
                writer.writerow(['Timestamp', 'Symbol', 'Action', 'Price', 'Quantity', 'Success'])
                
                for trade in self.trades:
                    execution = trade['execution']
                    writer.writerow([
                        trade['timestamp'],
                        execution.get('order', {}).get('symbol', ''),
                        execution.get('order', {}).get('action', ''),
                        execution.get('filled_price', 0),
                        execution.get('filled_quantity', 0),
                        execution.get('success', False)
                    ])
        
        logger.info(f"Trades exported: {filename}")
        return str(filename)
