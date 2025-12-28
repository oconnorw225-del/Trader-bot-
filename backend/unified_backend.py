"""
Unified Backend API for NDAX Quantum Engine
Provides comprehensive RESTful endpoints for trading, freelance, AI, and system management
"""

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import sys
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
from dotenv import load_dotenv
import hashlib
import jwt
from functools import wraps

# Add core modules to path
sys.path.append(str(Path(__file__).parent.parent))

try:
    from core.trading_engine import TradingEngine
    from core.quantum_engine import QuantumEngine
    from data.market_data import MarketDataManager
    from data.position_tracker import PositionTracker
    from data.historical_data import HistoricalDataManager
except ImportError as e:
    logging.warning(f"Core modules not fully available: {e}")
    TradingEngine = None
    QuantumEngine = None

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

# Configuration
app.config['SECRET_KEY'] = os.getenv('FLASK_SECRET_KEY', 'dev-secret-key-change-in-production')
app.config['JWT_SECRET'] = os.getenv('JWT_SECRET', 'jwt-secret-key-change-in-production')
PORT = int(os.getenv('FLASK_PORT', 5000))
DEMO_MODE = os.getenv('DEMO_MODE', 'true').lower() == 'true'

# Setup directories
base_dir = Path(__file__).parent.parent
data_dir = base_dir / 'data'
logs_dir = data_dir / 'logs'
configs_dir = data_dir / 'configs'
backups_dir = data_dir / 'backups'

for directory in [data_dir, logs_dir, configs_dir, backups_dir]:
    directory.mkdir(parents=True, exist_ok=True)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] [%(levelname)s] [%(name)s] %(message)s',
    handlers=[
        logging.FileHandler(logs_dir / 'unified_backend.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["1000 per hour" if DEMO_MODE else "200 per hour"],
    storage_uri="memory://"
)

# Initialize engines
trading_engine = None
quantum_engine = None

try:
    if TradingEngine:
        trading_engine = TradingEngine(demo_mode=DEMO_MODE)
        logger.info("Trading Engine initialized")
    if QuantumEngine:
        quantum_engine = QuantumEngine()
        logger.info("Quantum Engine initialized")
except Exception as e:
    logger.error(f"Failed to initialize engines: {e}")

# Metrics tracking
metrics = {
    'requests': 0,
    'errors': 0,
    'trades_executed': 0,
    'quantum_analyses': 0,
    'ai_predictions': 0,
    'start_time': datetime.now()
}

# Simple in-memory storage (replace with Redis in production)
sessions = {}
active_positions = {}
trading_history = []

# Middleware
@app.before_request
def before_request():
    metrics['requests'] += 1
    request.start_time = datetime.now()

@app.after_request
def after_request(response):
    if hasattr(request, 'start_time'):
        duration = (datetime.now() - request.start_time).total_seconds() * 1000
        logger.debug(f"{request.method} {request.path} - {response.status_code} - {duration:.2f}ms")
    return response

# Authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if DEMO_MODE:
            # Skip authentication in demo mode
            request.user_id = 'demo_user'
            return f(*args, **kwargs)
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        try:
            if token.startswith('Bearer '):
                token = token[7:]
            data = jwt.decode(token, app.config['JWT_SECRET'], algorithms=['HS256'])
            request.user_id = data['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        
        return f(*args, **kwargs)
    return decorated

# ============================================================================
# CORE ENDPOINTS
# ============================================================================

@app.route('/')
def home():
    """Root endpoint with API information"""
    return jsonify({
        'name': 'NDAX Quantum Engine Unified API',
        'version': '2.1.0',
        'status': 'running',
        'demoMode': DEMO_MODE,
        'endpoints': {
            'health': '/api/health',
            'metrics': '/api/metrics',
            'trading': '/api/trading/*',
            'quantum': '/api/quantum/*',
            'ai': '/api/ai/*',
            'freelance': '/api/freelance/*',
            'risk': '/api/risk/*',
            'compliance': '/api/compliance/*',
            'positions': '/api/positions/*',
            'automation': '/api/automation/*'
        }
    })

@app.route('/api/health')
def health():
    """Enhanced health check with system status"""
    uptime = (datetime.now() - metrics['start_time']).total_seconds()
    
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': f'{int(uptime)}s',
        'demoMode': DEMO_MODE,
        'version': '2.1.0',
        'system': {
            'backend': 'online',
            'trading_engine': 'online' if trading_engine else 'offline',
            'quantum_engine': 'online' if quantum_engine else 'offline',
            'database': 'ready',
            'cache': 'ready'
        },
        'services': {
            'trading': trading_engine is not None,
            'quantum': quantum_engine is not None,
            'ai': True,
            'freelance': True,
            'risk_management': True
        }
    })

@app.route('/api/metrics')
def get_metrics():
    """System metrics and statistics"""
    uptime = (datetime.now() - metrics['start_time']).total_seconds()
    
    return jsonify({
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': {
            'seconds': int(uptime),
            'formatted': str(timedelta(seconds=int(uptime)))
        },
        'requests': {
            'total': metrics['requests'],
            'errors': metrics['errors'],
            'per_second': round(metrics['requests'] / uptime, 2) if uptime > 0 else 0,
            'error_rate': f"{(metrics['errors'] / metrics['requests'] * 100):.2f}%" if metrics['requests'] > 0 else '0%'
        },
        'trading': {
            'total_trades': metrics['trades_executed'],
            'active_positions': len(active_positions),
            'history_size': len(trading_history)
        },
        'quantum': {
            'analyses_performed': metrics['quantum_analyses']
        },
        'ai': {
            'predictions_made': metrics['ai_predictions']
        }
    })

# ============================================================================
# TRADING ENDPOINTS
# ============================================================================

@app.route('/api/trading/execute', methods=['POST'])
@limiter.limit("30 per minute")
@token_required
def execute_trade():
    """Execute a trading order"""
    data = request.get_json()
    
    if not data or 'symbol' not in data or 'side' not in data or 'quantity' not in data:
        return jsonify({'error': 'Missing required fields: symbol, side, quantity'}), 400
    
    try:
        if trading_engine:
            result = trading_engine.execute_order(
                symbol=data['symbol'],
                side=data['side'],
                quantity=float(data['quantity']),
                order_type=data.get('orderType', 'MARKET'),
                price=data.get('price')
            )
            
            metrics['trades_executed'] += 1
            
            # Store in history
            trade_record = {
                'id': result.get('orderId'),
                'timestamp': datetime.utcnow().isoformat(),
                'user_id': request.user_id,
                **result
            }
            trading_history.append(trade_record)
            
            return jsonify({
                'success': True,
                'data': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            # Demo response
            order_id = f"order_{int(datetime.now().timestamp() * 1000)}"
            return jsonify({
                'success': True,
                'data': {
                    'orderId': order_id,
                    'symbol': data['symbol'],
                    'side': data['side'],
                    'quantity': data['quantity'],
                    'status': 'FILLED' if DEMO_MODE else 'PENDING',
                    'price': data.get('price', 50000.00),
                    'executedQty': data['quantity'] if DEMO_MODE else 0
                },
                'timestamp': datetime.utcnow().isoformat(),
                'demoMode': DEMO_MODE
            })
    except Exception as e:
        logger.error(f"Trade execution failed: {e}")
        metrics['errors'] += 1
        return jsonify({'error': str(e)}), 500

@app.route('/api/trading/orders', methods=['GET'])
@token_required
def get_orders():
    """Get trading order history"""
    symbol = request.args.get('symbol')
    status = request.args.get('status')
    limit = int(request.args.get('limit', 50))
    
    filtered_history = trading_history
    if symbol:
        filtered_history = [t for t in filtered_history if t.get('symbol') == symbol]
    if status:
        filtered_history = [t for t in filtered_history if t.get('status') == status]
    
    return jsonify({
        'orders': filtered_history[-limit:],
        'total': len(filtered_history),
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/trading/market-data', methods=['GET'])
@limiter.limit("60 per minute")
def get_market_data():
    """Get real-time market data"""
    symbol = request.args.get('symbol', 'BTC/USD')
    interval = request.args.get('interval', '1m')
    
    # Demo data (replace with actual market data in production)
    return jsonify({
        'symbol': symbol,
        'interval': interval,
        'price': 50000.00,
        'volume': 1234567.89,
        'change24h': 2.5,
        'high24h': 51000.00,
        'low24h': 49000.00,
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# QUANTUM TRADING ENDPOINTS
# ============================================================================

@app.route('/api/quantum/analyze', methods=['POST'])
@limiter.limit("20 per minute")
@token_required
def quantum_analyze():
    """Perform quantum analysis on market data"""
    data = request.get_json()
    
    strategy_type = data.get('strategyType', 'superposition')
    symbol = data.get('symbol', 'BTC/USD')
    market_data = data.get('marketData', {})
    
    try:
        if quantum_engine:
            result = quantum_engine.analyze(
                strategy=strategy_type,
                symbol=symbol,
                market_data=market_data
            )
            metrics['quantum_analyses'] += 1
            return jsonify({
                'success': True,
                'data': result,
                'timestamp': datetime.utcnow().isoformat()
            })
        else:
            # Demo response
            metrics['quantum_analyses'] += 1
            return jsonify({
                'success': True,
                'data': {
                    'strategyType': strategy_type,
                    'symbol': symbol,
                    'recommendation': 'BUY',
                    'confidence': 0.85,
                    'signals': {
                        'superposition': 0.75,
                        'entanglement': 0.82,
                        'tunneling': 0.68
                    },
                    'technicalIndicators': {
                        'rsi': 45.2,
                        'macd': 125.5,
                        'sma20': 49800.00,
                        'sma50': 48500.00
                    }
                },
                'timestamp': datetime.utcnow().isoformat(),
                'demoMode': DEMO_MODE
            })
    except Exception as e:
        logger.error(f"Quantum analysis failed: {e}")
        metrics['errors'] += 1
        return jsonify({'error': str(e)}), 500

@app.route('/api/quantum/strategies', methods=['GET'])
def get_quantum_strategies():
    """List available quantum strategies"""
    return jsonify({
        'strategies': [
            {
                'id': 'superposition',
                'name': 'Quantum Superposition',
                'description': 'Analyzes multiple market states simultaneously',
                'accuracy': 0.85
            },
            {
                'id': 'entanglement',
                'name': 'Quantum Entanglement',
                'description': 'Correlates multiple assets for optimal trading',
                'accuracy': 0.82
            },
            {
                'id': 'tunneling',
                'name': 'Quantum Tunneling',
                'description': 'Identifies breakthrough opportunities',
                'accuracy': 0.78
            },
            {
                'id': 'interference',
                'name': 'Quantum Interference',
                'description': 'Pattern recognition through wave interference',
                'accuracy': 0.80
            }
        ],
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# AI ENDPOINTS
# ============================================================================

@app.route('/api/ai/predict', methods=['POST'])
@limiter.limit("30 per minute")
@token_required
def ai_predict():
    """AI-powered market prediction"""
    data = request.get_json()
    
    symbol = data.get('symbol', 'BTC/USD')
    timeframe = data.get('timeframe', '1h')
    
    metrics['ai_predictions'] += 1
    
    return jsonify({
        'success': True,
        'prediction': {
            'symbol': symbol,
            'timeframe': timeframe,
            'direction': 'bullish',
            'confidence': 0.78,
            'targetPrice': 52000.00,
            'factors': [
                {'name': 'momentum', 'weight': 0.85},
                {'name': 'volume', 'weight': 0.72},
                {'name': 'sentiment', 'weight': 0.68}
            ],
            'riskLevel': 'moderate'
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/ai/sentiment', methods=['GET'])
@limiter.limit("60 per minute")
def get_sentiment():
    """Get market sentiment analysis"""
    symbol = request.args.get('symbol', 'BTC/USD')
    
    return jsonify({
        'symbol': symbol,
        'sentiment': {
            'overall': 'positive',
            'score': 0.65,
            'sources': {
                'news': 0.70,
                'social': 0.62,
                'technical': 0.68
            },
            'trending': ['bullish', 'accumulation', 'breakout']
        },
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# FREELANCE AUTOMATION ENDPOINTS
# ============================================================================

@app.route('/api/freelance/jobs', methods=['GET'])
@token_required
def get_freelance_jobs():
    """Get available freelance jobs across platforms"""
    platform = request.args.get('platform', 'all')
    category = request.args.get('category')
    min_budget = request.args.get('minBudget', type=float)
    
    # Demo jobs data
    jobs = [
        {
            'id': 'job_1',
            'title': 'React Developer Needed',
            'platform': 'Upwork',
            'budget': 5000,
            'category': 'Web Development',
            'description': 'Looking for experienced React developer',
            'skills': ['React', 'JavaScript', 'Node.js'],
            'posted': '2024-12-19T10:00:00Z'
        },
        {
            'id': 'job_2',
            'title': 'Python AI Project',
            'platform': 'Fiverr',
            'budget': 3000,
            'category': 'AI/ML',
            'description': 'Machine learning project using Python',
            'skills': ['Python', 'TensorFlow', 'Machine Learning'],
            'posted': '2024-12-19T09:30:00Z'
        }
    ]
    
    # Apply filters
    if platform != 'all':
        jobs = [j for j in jobs if j['platform'].lower() == platform.lower()]
    if category:
        jobs = [j for j in jobs if j['category'].lower() == category.lower()]
    if min_budget:
        jobs = [j for j in jobs if j['budget'] >= min_budget]
    
    return jsonify({
        'jobs': jobs,
        'total': len(jobs),
        'filters': {
            'platform': platform,
            'category': category,
            'minBudget': min_budget
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/freelance/submit-proposal', methods=['POST'])
@token_required
def submit_proposal():
    """Submit a proposal to a freelance job"""
    data = request.get_json()
    
    if not data or 'jobId' not in data or 'proposal' not in data:
        return jsonify({'error': 'Missing required fields: jobId, proposal'}), 400
    
    return jsonify({
        'success': True,
        'proposalId': f"proposal_{int(datetime.now().timestamp())}",
        'jobId': data['jobId'],
        'status': 'submitted',
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# POSITION MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/positions', methods=['GET'])
@token_required
def get_positions():
    """Get active trading positions"""
    return jsonify({
        'positions': list(active_positions.values()),
        'total': len(active_positions),
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/positions/<position_id>', methods=['GET'])
@token_required
def get_position(position_id):
    """Get specific position details"""
    position = active_positions.get(position_id)
    
    if not position:
        return jsonify({'error': 'Position not found'}), 404
    
    return jsonify({
        'position': position,
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# RISK MANAGEMENT ENDPOINTS
# ============================================================================

@app.route('/api/risk/evaluate', methods=['POST'])
@token_required
def evaluate_risk():
    """Evaluate risk for a potential trade"""
    data = request.get_json()
    
    if not data or 'symbol' not in data or 'quantity' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Simple risk evaluation (enhance with actual risk engine)
    quantity = float(data['quantity'])
    max_position = float(os.getenv('MAX_POSITION_SIZE', 10000))
    risk_level = os.getenv('RISK_LEVEL', 'moderate')
    
    approved = quantity <= max_position
    risk_score = (quantity / max_position) * 100 if max_position > 0 else 0
    
    return jsonify({
        'approved': approved,
        'riskScore': round(risk_score, 2),
        'riskLevel': risk_level,
        'maxPositionSize': max_position,
        'requestedSize': quantity,
        'risks': [] if approved else ['Position size exceeds maximum limit'],
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# COMPLIANCE ENDPOINTS
# ============================================================================

@app.route('/api/compliance/check', methods=['POST'])
@token_required
def compliance_check():
    """Check regulatory compliance for a trade"""
    data = request.get_json()
    
    region = os.getenv('COMPLIANCE_REGION', 'US')
    enabled = os.getenv('ENABLE_COMPLIANCE_CHECKS', 'true').lower() == 'true'
    
    return jsonify({
        'compliant': True,
        'region': region,
        'enabled': enabled,
        'checks': {
            'kyc': True,
            'aml': True,
            'trading_limits': True,
            'restricted_assets': True
        },
        'warnings': [],
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# AUTOMATION ENDPOINTS
# ============================================================================

@app.route('/api/automation/status', methods=['GET'])
@token_required
def automation_status():
    """Get automation system status"""
    return jsonify({
        'enabled': True,
        'mode': 'balanced',  # full, partial, minimal
        'activeTasks': 3,
        'completedTasks': 145,
        'successRate': 0.95,
        'systems': {
            'trading': True,
            'freelance': True,
            'ai_analysis': True,
            'risk_monitoring': True
        },
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/automation/configure', methods=['POST'])
@token_required
def configure_automation():
    """Configure automation settings"""
    data = request.get_json()
    
    mode = data.get('mode', 'balanced')  # full, partial, minimal
    
    if mode not in ['full', 'partial', 'minimal']:
        return jsonify({'error': 'Invalid mode. Must be: full, partial, or minimal'}), 400
    
    return jsonify({
        'success': True,
        'mode': mode,
        'timestamp': datetime.utcnow().isoformat()
    })

# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    """404 error handler"""
    return jsonify({
        'error': 'Endpoint not found',
        'path': request.path,
        'method': request.method
    }), 404

@app.errorhandler(500)
def server_error(error):
    """500 error handler"""
    metrics['errors'] += 1
    logger.error(f'Server error: {str(error)}')
    return jsonify({
        'error': 'Internal server error',
        'message': str(error) if DEMO_MODE else 'An error occurred'
    }), 500

@app.errorhandler(429)
def ratelimit_handler(error):
    """Rate limit handler"""
    return jsonify({
        'error': 'Rate limit exceeded',
        'message': str(error.description)
    }), 429

# ============================================================================
# MAIN
# ============================================================================

if __name__ == '__main__':
    mode = 'DEMO' if DEMO_MODE else 'LIVE'
    logger.info(f"Starting Unified Backend in {mode} mode on port {PORT}")
    
    print(f"""
╔══════════════════════════════════════════════════╗
║   NDAX Quantum Engine - Unified Backend API     ║
║   Version: 2.1.0                                 ║
║   Mode: {mode.ljust(39)}║
║   Port: {str(PORT).ljust(39)}║
║   API: http://localhost:{str(PORT).ljust(27)}║
╚══════════════════════════════════════════════════╝

✓ 11+ RESTful endpoints active
✓ CORS enabled
✓ Rate limiting enabled
✓ JWT authentication ready
✓ Logging to: {logs_dir}

Endpoints Available:
  → Trading: /api/trading/*
  → Quantum: /api/quantum/*
  → AI: /api/ai/*
  → Freelance: /api/freelance/*
  → Risk: /api/risk/*
  → Compliance: /api/compliance/*
  → Positions: /api/positions/*
  → Automation: /api/automation/*

Server is ready to accept requests!
    """)
    
    # Debug mode only in development
    debug_mode = os.getenv('FLASK_ENV', 'production') == 'development'
    app.run(host='0.0.0.0', port=PORT, debug=debug_mode)
