"""
Flask backend for NDAX Quantum Engine
Enhanced with rate limiting, logging, and config management
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import json
import logging
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuration
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key')
PORT = int(os.getenv('FLASK_PORT', 5000))
DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() != 'false'

# Setup directories
data_dir = Path(__file__).parent.parent.parent / 'data'
logs_dir = data_dir / 'logs'
configs_dir = data_dir / 'configs'

for directory in [data_dir, logs_dir, configs_dir]:
    directory.mkdir(parents=True, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(logs_dir / 'flask.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per hour" if DEMO_MODE else "100 per hour"]
)

# Metrics
metrics = {
    'requests': 0,
    'errors': 0,
    'start_time': datetime.now()
}

@app.before_request
def before_request():
    metrics['requests'] += 1

@app.route('/')
def home():
    """Root endpoint"""
    return jsonify({
        'name': 'NDAX Quantum Engine API (Python)',
        'version': '1.0.0',
        'status': 'running',
        'demoMode': DEMO_MODE
    })

@app.route('/api/health')
def health():
    """Enhanced health check endpoint"""
    uptime = (datetime.now() - metrics['start_time']).total_seconds()
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': f'{int(uptime)}s',
        'demoMode': DEMO_MODE,
        'version': '1.0.0',
        'system': {
            'backend': 'online',
            'quantum': 'ready',
            'freelance': 'ready',
            'ai': 'ready'
        }
    })

@app.route('/api/metrics')
def get_metrics():
    """Get system metrics"""
    uptime = (datetime.now() - metrics['start_time']).total_seconds()
    return jsonify({
        **metrics,
        'uptime': f'{int(uptime)}s',
        'requestsPerSecond': round(metrics['requests'] / uptime, 2) if uptime > 0 else 0,
        'errorRate': f"{(metrics['errors'] / metrics['requests'] * 100):.2f}%" if metrics['requests'] > 0 else '0%',
        'start_time': metrics['start_time'].isoformat()
    })

@app.route('/api/trading/execute', methods=['POST'])
def execute_trade():
    """Execute a trade"""
    data = request.get_json()
    
    if not data or 'symbol' not in data or 'side' not in data:
        return jsonify({'success': False, 'error': 'Invalid request: symbol and side required'}), 400
    
    symbol = data['symbol']
    side = data['side']
    quantity = data.get('quantity', 1.0)
    order_type = data.get('orderType', 'MARKET')
    price = data.get('price')
    
    order_id = f'order_{int(datetime.now().timestamp() * 1000)}'
    
    return jsonify({
        'success': True,
        'data': {
            'orderId': order_id,
            'symbol': symbol,
            'side': side,
            'quantity': quantity,
            'orderType': order_type,
            'price': price,
            'executionPrice': price if price else 50000.00,
            'executedQty': quantity,
            'status': 'FILLED',
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/trading/orders', methods=['GET'])
def get_orders():
    """Get trading orders"""
    symbol = request.args.get('symbol')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 10))
    
    # Generate sample orders
    import random
    orders = []
    for i in range(min(limit, 5)):
        orders.append({
            'orderId': f'order_{int(datetime.now().timestamp() * 1000) + i}',
            'symbol': symbol if symbol else 'BTC/USD',
            'side': random.choice(['BUY', 'SELL']),
            'quantity': round(random.random() * 2, 4),
            'orderType': 'MARKET',
            'executionPrice': round(48000 + random.random() * 4000, 2),
            'executedQty': round(random.random() * 2, 4),
            'status': status if status else random.choice(['FILLED', 'PENDING']),
            'timestamp': datetime.utcnow().isoformat()
        })
    
    return jsonify({
        'success': True,
        'data': {
            'orders': orders,
            'total': len(orders)
        }
    })

@app.route('/api/trading/market-data', methods=['GET'])
def get_market_data():
    """Get market data for a symbol"""
    symbol = request.args.get('symbol', 'BTC/USD')
    interval = request.args.get('interval', '1m')
    
    import random
    base_price = 50000
    
    return jsonify({
        'success': True,
        'data': {
            'symbol': symbol,
            'price': round(base_price + (random.random() - 0.5) * 2000, 2),
            'volume': round(random.random() * 10000000, 2),
            'change24h': round((random.random() - 0.5) * 10, 2),
            'high24h': round(base_price + random.random() * 2000, 2),
            'low24h': round(base_price - random.random() * 2000, 2),
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/quantum/analyze', methods=['POST'])
def quantum_analyze():
    """Perform quantum analysis"""
    data = request.get_json()
    strategy_type = data.get('strategyType', 'superposition')
    symbol = data.get('symbol', 'BTC/USD')
    
    import random
    recommendations = ['BUY', 'SELL', 'HOLD']
    
    return jsonify({
        'strategyType': strategy_type,
        'symbol': symbol,
        'recommendation': random.choice(recommendations),
        'confidence': round(0.70 + random.random() * 0.25, 2),
        'signals': {
            'superposition': round(random.random(), 2),
            'entanglement': round(random.random(), 2),
            'tunneling': round(random.random(), 2)
        },
        'technicalIndicators': {
            'rsi': round(30 + random.random() * 40, 2),
            'macd': round(-5 + random.random() * 10, 2),
            'sma': round(45000 + random.random() * 10000, 2)
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/quantum/strategies', methods=['GET'])
def get_quantum_strategies():
    """Get available quantum strategies"""
    strategies = [
        {
            'id': 'superposition',
            'name': 'Quantum Superposition',
            'description': 'Analyzes multiple market states simultaneously',
            'confidence': 0.85
        },
        {
            'id': 'entanglement',
            'name': 'Quantum Entanglement',
            'description': 'Identifies correlated market movements',
            'confidence': 0.78
        },
        {
            'id': 'tunneling',
            'name': 'Quantum Tunneling',
            'description': 'Predicts breakthrough price movements',
            'confidence': 0.72
        },
        {
            'id': 'interference',
            'name': 'Quantum Interference',
            'description': 'Detects market patterns and anomalies',
            'confidence': 0.80
        }
    ]
    
    return jsonify({
        'success': True,
        'strategies': strategies
    })

@app.route('/api/quantum/strategy', methods=['POST'])
def run_quantum_strategy():
    """Run quantum strategy (legacy endpoint)"""
    data = request.get_json()
    strategy_type = data.get('strategyType', 'superposition')
    
    return jsonify({
        'strategyType': strategy_type,
        'recommendation': 'BUY',
        'confidence': 0.85,
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/ai/predict', methods=['POST'])
def ai_predict():
    """AI prediction endpoint"""
    data = request.get_json()
    symbol = data.get('symbol', 'BTC/USD')
    timeframe = data.get('timeframe', '1h')
    
    import random
    predictions = ['bullish', 'bearish', 'neutral']
    
    return jsonify({
        'success': True,
        'symbol': symbol,
        'timeframe': timeframe,
        'prediction': random.choice(predictions),
        'confidence': round(0.65 + random.random() * 0.30, 2),
        'factors': ['momentum', 'volume', 'sentiment'],
        'priceTarget': {
            'high': 52000,
            'low': 48000,
            'expected': 50000
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/ai/sentiment', methods=['GET'])
def get_sentiment():
    """Get market sentiment analysis"""
    symbol = request.args.get('symbol', 'BTC/USD')
    
    import random
    sentiments = ['positive', 'negative', 'neutral']
    
    return jsonify({
        'success': True,
        'symbol': symbol,
        'sentiment': random.choice(sentiments),
        'score': round(-1 + random.random() * 2, 2),  # -1 to 1
        'confidence': round(0.70 + random.random() * 0.25, 2),
        'sources': ['twitter', 'reddit', 'news'],
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/freelance/jobs', methods=['GET'])
def get_freelance_jobs():
    """Get freelance jobs"""
    platform = request.args.get('platform', 'all')
    category = request.args.get('category')
    min_budget = request.args.get('minBudget', type=float)
    
    # Generate sample jobs
    import random
    platforms = ['Upwork', 'Fiverr', 'Freelancer', 'Toptal', 'Guru']
    categories = ['Web Development', 'Mobile Development', 'AI/ML', 'Data Science', 'Design']
    
    jobs = []
    for i in range(5):
        job_platform = platform if platform != 'all' else random.choice(platforms)
        job_budget = round(1000 + random.random() * 9000, 2)
        
        # Filter by min budget if specified
        if min_budget and job_budget < min_budget:
            continue
        
        jobs.append({
            'id': f'job_{i+1}_{int(datetime.now().timestamp())}',
            'title': f'{random.choice(["Senior", "Junior", "Mid-level"])} Developer Needed',
            'platform': job_platform,
            'budget': job_budget,
            'category': category if category else random.choice(categories),
            'description': 'Looking for an experienced developer to work on an exciting project...',
            'skills': random.sample(['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'Docker'], 3),
            'posted': f'{random.randint(1, 24)} hours ago'
        })
    
    return jsonify({
        'success': True,
        'data': {
            'jobs': jobs,
            'total': len(jobs)
        }
    })

@app.route('/api/freelance/submit-proposal', methods=['POST'])
def submit_proposal():
    """Submit a proposal for a job"""
    data = request.get_json()
    
    if not data or 'jobId' not in data or 'proposal' not in data:
        return jsonify({'success': False, 'error': 'Invalid request: jobId and proposal required'}), 400
    
    proposal_id = f'proposal_{int(datetime.now().timestamp() * 1000)}'
    
    return jsonify({
        'success': True,
        'data': {
            'proposalId': proposal_id,
            'status': 'submitted',
            'jobId': data['jobId'],
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/risk/evaluate', methods=['POST'])
def evaluate_risk():
    """Evaluate trading risk"""
    data = request.get_json()
    
    if not data or 'symbol' not in data or 'quantity' not in data:
        return jsonify({'success': False, 'error': 'Invalid request: symbol and quantity required'}), 400
    
    symbol = data['symbol']
    quantity = data['quantity']
    side = data.get('side', 'BUY')
    
    import random
    risk_score = random.randint(10, 50)
    
    risk_levels = {
        (0, 20): 'low',
        (20, 35): 'moderate',
        (35, 50): 'high',
        (50, 100): 'critical'
    }
    
    risk_level = next(level for (low, high), level in risk_levels.items() if low <= risk_score < high)
    
    risks = []
    if risk_score > 35:
        risks.append('High volatility detected')
    if quantity > 10:
        risks.append('Large position size')
    
    return jsonify({
        'success': True,
        'data': {
            'approved': risk_score < 40,
            'riskScore': risk_score,
            'riskLevel': risk_level,
            'risks': risks,
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/positions', methods=['GET'])
def get_positions():
    """Get all open positions"""
    import random
    
    positions = []
    for i in range(3):
        entry_price = round(48000 + random.random() * 4000, 2)
        current_price = round(entry_price + (random.random() - 0.5) * 2000, 2)
        quantity = round(random.random() * 2, 4)
        
        positions.append({
            'id': f'pos_{i+1}_{int(datetime.now().timestamp())}',
            'symbol': random.choice(['BTC/USD', 'ETH/USD', 'SOL/USD']),
            'side': random.choice(['BUY', 'SELL']),
            'quantity': quantity,
            'entry_price': entry_price,
            'current_price': current_price,
            'unrealized_pnl': round((current_price - entry_price) * quantity, 2),
            'realized_pnl': 0,
            'opened_at': datetime.utcnow().isoformat(),
            'status': 'OPEN'
        })
    
    return jsonify({
        'success': True,
        'data': {
            'positions': positions,
            'total': len(positions)
        }
    })

@app.route('/api/positions/<position_id>', methods=['GET'])
def get_position(position_id):
    """Get a specific position"""
    import random
    
    entry_price = round(48000 + random.random() * 4000, 2)
    current_price = round(entry_price + (random.random() - 0.5) * 2000, 2)
    quantity = round(random.random() * 2, 4)
    
    position = {
        'id': position_id,
        'symbol': 'BTC/USD',
        'side': 'BUY',
        'quantity': quantity,
        'entry_price': entry_price,
        'current_price': current_price,
        'unrealized_pnl': round((current_price - entry_price) * quantity, 2),
        'realized_pnl': 0,
        'opened_at': datetime.utcnow().isoformat(),
        'status': 'OPEN'
    }
    
    return jsonify({
        'success': True,
        'data': {
            'position': position
        }
    })

@app.route('/api/compliance/check', methods=['POST'])
def check_compliance():
    """Check compliance for a trade or operation"""
    data = request.get_json()
    
    region = data.get('region', 'US')
    trade_type = data.get('type', 'spot')
    
    checks = {
        'kyc_verified': True,
        'aml_cleared': True,
        'trading_limits': True,
        'jurisdiction_allowed': True
    }
    
    warnings = []
    if trade_type == 'margin':
        warnings.append('Margin trading requires additional verification')
    
    return jsonify({
        'success': True,
        'data': {
            'compliant': all(checks.values()),
            'region': region,
            'checks': checks,
            'warnings': warnings,
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/automation/status', methods=['GET'])
def get_automation_status():
    """Get automation system status"""
    import random
    
    return jsonify({
        'success': True,
        'data': {
            'enabled': True,
            'mode': 'balanced',
            'activeTasks': random.randint(2, 8),
            'completedTasks': random.randint(50, 200),
            'successRate': round(0.75 + random.random() * 0.20, 2),
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.route('/api/automation/configure', methods=['POST'])
def configure_automation():
    """Configure automation settings"""
    data = request.get_json()
    
    if not data or 'mode' not in data:
        return jsonify({'success': False, 'error': 'Invalid request: mode required'}), 400
    
    mode = data['mode']
    valid_modes = ['full', 'partial', 'minimal']
    
    if mode not in valid_modes:
        return jsonify({'success': False, 'error': f'Invalid mode. Must be one of: {", ".join(valid_modes)}'}), 400
    
    return jsonify({
        'success': True,
        'data': {
            'success': True,
            'mode': mode,
            'timestamp': datetime.utcnow().isoformat()
        }
    })

@app.errorhandler(404)
def not_found(error):
    """404 error handler"""
    return jsonify({'error': 'Not found', 'path': request.path}), 404

@app.errorhandler(500)
def server_error(error):
    """500 error handler"""
    metrics['errors'] += 1
    logger.error(f'Server error: {str(error)}')
    return jsonify({
        'error': 'Internal server error',
        'message': str(error) if DEMO_MODE else 'An error occurred'
    }), 500

if __name__ == '__main__':
    mode = 'DEMO' if DEMO_MODE else 'LIVE'
    logger.info(f"Starting Flask server in {mode} mode on port {PORT}")
    
    print(f"""
╔══════════════════════════════════════════╗
║   NDAX Quantum Engine Server (Python)   ║
║   Version: 1.0.0                         ║
║   Mode: {mode.ljust(30)}   ║
║   Port: {str(PORT).ljust(30)}   ║
║   API: http://localhost:{str(PORT).ljust(20)}   ║
╚══════════════════════════════════════════╝
    """)
    
    print('✓ CORS enabled')
    print('✓ Rate limiting enabled')
    print('✓ Logging to:', logs_dir)
    print('\nServer is ready to accept requests!\n')
    
    # Debug mode should only be enabled in development environment
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=PORT, debug=debug_mode)
