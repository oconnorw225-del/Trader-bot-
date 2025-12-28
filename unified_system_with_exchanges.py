"""
Unified System with Exchange Integration
Python backend for Chimera Trading System
Integrates with NDAX and Binance via real API connectors
"""

import os
import sys
import logging
from datetime import datetime
from typing import Dict, Optional, Any
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv

# Add parent directory to path for imports
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from chimera_core.exchange.real_api_connectors import NDaxConnector, BinanceConnector

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('chimera_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
PORT = int(os.getenv('PYTHON_BACKEND_PORT', 8000))
TESTNET = os.getenv('TESTNET', 'true').lower() == 'true'

# Exchange connectors
exchange_connectors: Dict[str, Any] = {}


def initialize_exchanges():
    """Initialize exchange connectors from environment variables"""
    global exchange_connectors
    
    logger.info("Initializing exchange connectors...")
    logger.info(f"Testnet mode: {TESTNET}")
    
    # Initialize NDAX connector
    ndax_api_key = os.getenv('NDAX_API_KEY')
    ndax_api_secret = os.getenv('NDAX_API_SECRET')
    ndax_user_id = os.getenv('NDAX_USER_ID')
    ndax_account_id = os.getenv('NDAX_ACCOUNT_ID')
    
    if ndax_api_key and ndax_api_secret and ndax_user_id and ndax_account_id:
        try:
            ndax = NDaxConnector(
                api_key=ndax_api_key,
                api_secret=ndax_api_secret,
                user_id=ndax_user_id,
                account_id=ndax_account_id,
                testnet=TESTNET
            )
            exchange_connectors['ndax'] = ndax
            logger.info("NDAX connector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize NDAX connector: {str(e)}")
    else:
        logger.warning("NDAX credentials not found in environment")
    
    # Initialize Binance connector
    binance_api_key = os.getenv('BINANCE_API_KEY')
    binance_api_secret = os.getenv('BINANCE_API_SECRET')
    
    if binance_api_key and binance_api_secret:
        try:
            binance = BinanceConnector(
                api_key=binance_api_key,
                api_secret=binance_api_secret,
                testnet=TESTNET
            )
            exchange_connectors['binance'] = binance
            logger.info("Binance connector initialized")
        except Exception as e:
            logger.error(f"Failed to initialize Binance connector: {str(e)}")
    else:
        logger.warning("Binance credentials not found in environment")
    
    logger.info(f"Initialized {len(exchange_connectors)} exchange connector(s)")


@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        'name': 'Chimera Trading System - Python Backend',
        'version': '2.1.0',
        'status': 'running',
        'testnet': TESTNET,
        'exchanges': list(exchange_connectors.keys()),
    })


@app.route('/api/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'testnet': TESTNET,
        'exchanges': {
            name: 'connected' if connector.is_connected() else 'disconnected'
            for name, connector in exchange_connectors.items()
        },
    })


@app.route('/api/exchanges')
def list_exchanges():
    """List available exchanges"""
    return jsonify({
        'success': True,
        'exchanges': [
            {
                'id': name,
                'name': name.upper(),
                'connected': connector.is_connected(),
                'testnet': TESTNET,
            }
            for name, connector in exchange_connectors.items()
        ],
    })


@app.route('/api/exchange/status/<exchange_id>')
def exchange_status(exchange_id: str):
    """Get exchange connection status"""
    exchange_id = exchange_id.lower()
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    return jsonify({
        'success': True,
        'exchange': exchange_id,
        'connected': connector.is_connected(),
        'testnet': TESTNET,
    })


@app.route('/api/exchange/connect', methods=['POST'])
def connect_exchange():
    """Connect to an exchange"""
    data = request.get_json()
    exchange_id = data.get('exchange_id', '').lower()
    
    if not exchange_id:
        return jsonify({
            'success': False,
            'error': 'exchange_id is required',
        }), 400
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    try:
        result = connector.connect()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Connection error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/trading/balance', methods=['GET'])
def get_balance():
    """Get trading balance"""
    exchange_id = request.args.get('exchange', 'ndax').lower()
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    try:
        result = connector.get_balance()
        return jsonify(result)
    except Exception as e:
        logger.error(f"Balance error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/trading/order', methods=['POST'])
def place_order():
    """Place a trading order"""
    data = request.get_json()
    
    exchange_id = data.get('exchange', 'ndax').lower()
    symbol = data.get('symbol')
    side = data.get('side')
    order_type = data.get('type', 'market')
    quantity = data.get('quantity')
    price = data.get('price')
    
    # Validation
    if not all([symbol, side, quantity]):
        return jsonify({
            'success': False,
            'error': 'symbol, side, and quantity are required',
        }), 400
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    try:
        result = connector.place_order(
            symbol=symbol,
            side=side,
            order_type=order_type,
            quantity=float(quantity),
            price=float(price) if price else None,
        )
        return jsonify(result)
    except Exception as e:
        logger.error(f"Order error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/trading/cancel', methods=['POST'])
def cancel_order():
    """Cancel a trading order"""
    data = request.get_json()
    
    exchange_id = data.get('exchange', 'ndax').lower()
    order_id = data.get('order_id')
    symbol = data.get('symbol')  # Required for Binance
    
    if not order_id:
        return jsonify({
            'success': False,
            'error': 'order_id is required',
        }), 400
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    try:
        if exchange_id == 'binance' and symbol:
            result = connector.cancel_order(symbol=symbol, order_id=order_id)
        else:
            result = connector.cancel_order(order_id=order_id)
        
        return jsonify(result)
    except Exception as e:
        logger.error(f"Cancel error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/trading/positions', methods=['GET'])
def get_positions():
    """Get open positions"""
    exchange_id = request.args.get('exchange', 'ndax').lower()
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    # For now, return balance as positions
    # In production, implement proper positions endpoint
    connector = exchange_connectors[exchange_id]
    
    try:
        balance_result = connector.get_balance()
        
        if balance_result.get('success'):
            positions = []
            for currency, amount in balance_result.get('balances', {}).items():
                if isinstance(amount, dict):
                    total = amount.get('total', 0)
                else:
                    total = amount
                
                if total > 0:
                    positions.append({
                        'symbol': currency,
                        'amount': total,
                        'exchange': exchange_id,
                    })
            
            return jsonify({
                'success': True,
                'positions': positions,
            })
        else:
            return jsonify(balance_result)
    except Exception as e:
        logger.error(f"Positions error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/market/<symbol>', methods=['GET'])
def get_market_data(symbol: str):
    """Get market data for a symbol"""
    exchange_id = request.args.get('exchange', 'ndax').lower()
    
    if exchange_id not in exchange_connectors:
        return jsonify({
            'success': False,
            'error': f'Exchange {exchange_id} not configured',
        }), 404
    
    connector = exchange_connectors[exchange_id]
    
    try:
        result = connector.get_market_data(symbol)
        return jsonify(result)
    except Exception as e:
        logger.error(f"Market data error for {exchange_id}: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e),
        }), 500


@app.route('/api/quantum/analyze', methods=['POST'])
def quantum_analyze():
    """Perform quantum analysis (placeholder)"""
    data = request.get_json()
    
    # Placeholder for quantum analysis
    # In production, integrate with actual quantum algorithms
    return jsonify({
        'success': True,
        'analysis': {
            'strategy': data.get('strategy', 'superposition'),
            'recommendation': 'HOLD',
            'confidence': 0.75,
            'timestamp': datetime.utcnow().isoformat(),
        },
        'message': 'Quantum analysis placeholder - integrate with core/quantum_engine.py',
    })


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found',
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    logger.error(f"Internal error: {str(error)}")
    return jsonify({
        'success': False,
        'error': 'Internal server error',
    }), 500


if __name__ == '__main__':
    logger.info("=" * 60)
    logger.info("Chimera Trading System - Python Backend")
    logger.info(f"Version: 2.1.0")
    logger.info(f"Testnet Mode: {TESTNET}")
    logger.info(f"Port: {PORT}")
    logger.info("=" * 60)
    
    # Initialize exchanges
    initialize_exchanges()
    
    # Start Flask server
    logger.info(f"Starting server on port {PORT}...")
    app.run(
        host='0.0.0.0',
        port=PORT,
        debug=os.getenv('FLASK_ENV', 'production') == 'development',
    )
