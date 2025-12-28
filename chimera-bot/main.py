"""
CHIMERA-BOT - Main Entry Point
Unified modular trading bot with risk management and routing
"""

import sys
import logging
from pathlib import Path
from typing import Dict, Any

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import Config
from execution.governor import Governor
from execution.executor import Executor
from strategy.chimera_core import ChimeraCore
from reporting.hourly import HourlyReporter

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('chimera-bot.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)


class ChimeraBot:
    """
    Main Chimera Bot orchestrator
    Coordinates strategy, risk management, execution, and reporting
    """
    
    def __init__(self, config: Config):
        self.config = config
        self.strategy = ChimeraCore(config)
        self.governor = Governor(config)
        self.executor = Executor(config)
        self.reporter = HourlyReporter(config)
        
        logger.info(f"ChimeraBot initialized in {config.mode} mode")
        logger.info(f"Risk level: {config.risk_level}")
        
    def run(self) -> Dict[str, Any]:
        """
        Main execution loop
        Returns execution summary
        """
        try:
            logger.info("Starting ChimeraBot execution cycle")
            
            # 1. Generate trading signal from strategy
            signal = self.strategy.generate_signal()
            logger.info(f"Strategy signal: {signal}")
            
            # 2. Check with risk governor
            risk_check = self.governor.evaluate(signal)
            
            if not risk_check['approved']:
                logger.warning(f"Trade rejected by governor: {risk_check['reason']}")
                return {
                    'success': False,
                    'reason': 'rejected_by_risk_governor',
                    'details': risk_check
                }
            
            logger.info(f"Trade approved by governor: {risk_check['reason']}")
            
            # 3. Execute trade via appropriate path (paper/live)
            execution_result = self.executor.execute(signal, risk_check)
            
            # 4. Report results
            self.reporter.log_trade(execution_result)
            
            logger.info(f"Execution complete: {execution_result}")
            
            return {
                'success': True,
                'signal': signal,
                'risk_check': risk_check,
                'execution': execution_result
            }
            
        except Exception as e:
            logger.error(f"Error in execution cycle: {str(e)}", exc_info=True)
            return {
                'success': False,
                'error': str(e)
            }
    
    def status(self) -> Dict[str, Any]:
        """Get current bot status"""
        return {
            'mode': self.config.mode,
            'risk_level': self.config.risk_level,
            'executor_status': self.executor.status(),
            'reporter_status': self.reporter.status()
        }


def main():
    """Main entry point"""
    logger.info("=" * 60)
    logger.info("CHIMERA-BOT Starting")
    logger.info("=" * 60)
    
    # Load configuration
    config = Config.from_env()
    
    # Initialize bot
    bot = ChimeraBot(config)
    
    # Show status
    status = bot.status()
    logger.info(f"Bot Status: {status}")
    
    # Run execution cycle
    result = bot.run()
    
    # Log final result
    if result['success']:
        logger.info("✅ Execution cycle completed successfully")
    else:
        logger.error(f"❌ Execution cycle failed: {result.get('reason', 'unknown')}")
    
    logger.info("=" * 60)
    logger.info("CHIMERA-BOT Finished")
    logger.info("=" * 60)
    
    return 0 if result['success'] else 1


if __name__ == "__main__":
    sys.exit(main())
