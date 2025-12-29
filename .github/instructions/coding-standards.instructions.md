---
name: NDAX-Quantum-Engine-Instructions
description: Comprehensive development guidelines for the NDAX Quantum Engine project
applyTo:
  - "**/*"
---

# GitHub Copilot Instructions for NDAX Quantum Engine

## Project Overview

The NDAX Quantum Engine is a **production-ready** unified modular platform combining:
- **Quantum Trading Algorithms** - Advanced trading strategies using quantum-inspired algorithms
- **AI Freelance Automation** - Multi-platform job search and proposal automation
- **Risk Management** - Real-time position sizing and loss prevention
- **Compliance & Security** - Regional regulatory checks and AES-256 encryption

**Current Status:** Version 2.1.0 | 350/378 tests passing | Production-ready

### Project Goals
1. Provide a reliable, performant trading automation platform
2. Maintain strict security and compliance standards
3. Enable rapid feature development with comprehensive testing
4. Support multiple deployment environments (mobile, desktop, cloud)

## Technology Stack

### Frontend
- **React** 18.2.0 - UI components
- **Recharts** - Data visualization
- ES Modules (ESM) with JSX

### Backend
- **Node.js** (Express 5.1.0) - Primary backend server (port 3000)
- **Python** (Flask 3.0.0) - Secondary backend server (port 5000)
- **dotenv** - Environment configuration

### Development Tools
- **Jest** 29.7.0 - Testing framework
- **ESLint** 8.x - Code linting
- **Babel** - JavaScript transpilation

### Key Libraries
- **axios** - HTTP client
- **crypto-js** - Encryption (AES-256)
- **jsonwebtoken** - JWT authentication

## Project Structure

```
src/
├── components/        # React UI components (Wizard, Dashboard, QuantumEngine, etc.)
├── freelance/         # Freelance platform integrations and AI modules
│   ├── ai/           # AI orchestrator, plagiarism checker, learning modules
│   └── platforms/    # Upwork, Fiverr, Freelancer, Toptal, Guru, PeoplePerHour
├── quantum/          # Quantum trading strategies and logic
├── shared/           # Shared utilities (encryption, analytics, compliance, recovery)
└── styles/           # CSS styles

backend/
├── nodejs/           # Express server
└── python/           # Flask server

tests/
├── modules/          # Unit tests for each module
└── stress/           # Stress and performance tests
```

## Coding Standards

### General Principles
1. **Security First** - Never commit secrets, always encrypt sensitive data
2. **Test Everything** - Maintain >80% coverage, all features need tests
3. **Minimal Changes** - Change only what's needed to solve the problem
4. **Performance Matters** - Meet performance targets (see below)
5. **Self-Documenting Code** - Write clear code, minimal comments

### JavaScript/React Standards

**Module System:**
- Use ES Modules (`import`/`export`) - `"type": "module"` in package.json
- Use async/await for asynchronous operations
- Prefer arrow functions for callbacks

**React Components:**
```jsx
// ✅ GOOD: Function component with clear structure
import React, { useState, useEffect } from 'react';

export const TradingDashboard = ({ userId, apiKey }) => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await api.getTrades(userId);
        setTrades(response.data);
      } catch (error) {
        console.error('Failed to fetch trades:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrades();
  }, [userId]);
  
  const handleTradeSubmit = async (trade) => {
    // Handler logic here
  };
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="trading-dashboard">
      {trades.map(trade => (
        <TradeCard key={trade.id} trade={trade} />
      ))}
    </div>
  );
};

// ❌ BAD: Class component, inline styles, no error handling
class BadDashboard extends React.Component {
  componentDidMount() {
    api.getTrades().then(data => this.setState({trades: data}));
  }
  render() {
    return <div style={{color: 'red'}}>{this.state.trades}</div>;
  }
}
```

**State Management Rules:**
- Use `useState` for local component state
- Use `useEffect` for side effects and data fetching
- Lift state up when multiple components need access
- Avoid prop drilling - use React Context for deeply nested data
- Never mutate state directly - always use setState

**Styling Guidelines:**
- Use CSS classes, NEVER inline styles
- Follow kebab-case for class names (`trading-dashboard`, not `tradingDashboard`)
- Keep all styles in `/src/styles/` directory
- Use semantic HTML elements (`<nav>`, `<article>`, `<section>`)

**JSX Best Practices:**
- Escape apostrophes: use `&apos;` instead of `'` in JSX text
- Always add `key` prop to list items (use unique IDs, not array indices)
- Keep JSX expressions simple and readable
- Extract complex logic into separate functions

**Event Handlers:**
- Prefix with `handle` (e.g., `handleClick`, `handleSubmit`, `handleTradeExecute`)
- Keep handlers close to where they're used in the component
- Use arrow functions to avoid binding issues

**Error Handling:**
```javascript
// ✅ GOOD: Proper error handling with logging
try {
  const result = await tradingEngine.executeOrder(order);
  return { success: true, data: result };
} catch (error) {
  logger.error('Order execution failed:', error);
  return { success: false, error: error.message };
}

// ❌ BAD: Silent failure, no error information
try {
  const result = await tradingEngine.executeOrder(order);
  return result;
} catch (e) {
  return null;
}
```

### Python Standards
- Follow PEP 8 style guide strictly
- Use Flask decorators for route definitions
- Handle errors with try/except blocks
- Use type hints for function parameters and return values
- Use f-strings for string formatting (not % or .format())

```python
# ✅ GOOD: Type hints, error handling, f-strings
from typing import Dict, List, Optional
from flask import jsonify

@app.route('/api/trading/execute', methods=['POST'])
def execute_trade() -> Dict[str, any]:
    try:
        data = request.get_json()
        result = trading_engine.execute(data)
        return jsonify({'success': True, 'data': result}), 200
    except ValueError as e:
        logger.error(f'Invalid trade data: {e}')
        return jsonify({'success': False, 'error': str(e)}), 400
    except Exception as e:
        logger.error(f'Trade execution failed: {e}')
        return jsonify({'success': False, 'error': 'Internal error'}), 500

# ❌ BAD: No type hints, poor error handling, string concatenation
@app.route('/api/trading/execute', methods=['POST'])
def execute_trade():
    data = request.get_json()
    result = trading_engine.execute(data)
    return jsonify(result)
```

### Bash/Shell Script Standards
- Use `#!/bin/bash` shebang at the start of all bash scripts
- Enable strict error handling with `set -e` (exit on error)
- Use meaningful variable names in UPPERCASE for constants
- Add color-coded output for better readability (RED for errors, GREEN for success, YELLOW for warnings)
- Include comprehensive error checking for all git and gh commands
- Provide clear usage instructions and help text
- Use functions to organize code logically
- Add comments for complex logic
- Test scripts with bash syntax validation before committing
- Make scripts executable: `chmod +x script.sh`

```bash
# ✅ GOOD: Well-structured bash script
#!/bin/bash
set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

# Configuration
REPO="owner/repo"
BASE_BRANCH="main"

# Function with error handling
create_pr() {
    local branch=$1
    
    if ! git rev-parse --verify "origin/$branch" > /dev/null 2>&1; then
        echo -e "${RED}ERROR: Branch does not exist${NC}"
        return 1
    fi
    
    echo -e "${GREEN}Creating PR for $branch${NC}"
    # In production: gh pr create --base "$BASE_BRANCH" --head "$branch" --title "..." --body "..."
    gh pr create --base "$BASE_BRANCH" --head "$branch" || {
        echo -e "${RED}Failed to create PR${NC}"
        return 1
    }
}

# Main execution
main() {
    echo "Starting process..."
    create_pr "feature-branch"
}

main

# ❌ BAD: No error handling, unclear variables, unquoted variables
#!/bin/bash
b="main"
git checkout $b  # Should be "$b" - causes word splitting and pathname expansion
gh pr create  # No error checking - continues even if checkout fails
```

### Markdown Documentation Standards
- Use clear, hierarchical headings (H1 for title, H2 for main sections, H3 for subsections)
- Include a table of contents for long documents (>100 lines)
- Use code blocks with language specifiers for syntax highlighting
- Keep lines under 120 characters for readability
- Use relative links for internal documentation references
- Include examples and usage instructions
- Add status badges where appropriate
- Use tables for structured data
- Include a "Last Updated" timestamp for tracking documents
- Follow consistent formatting across all markdown files

**Good Example:**
- Clear hierarchical structure with H1, H2, H3 headings
- Last Updated timestamp at the top
- Code blocks with language specifiers (bash, javascript)
- Tables for structured API reference data
- Proper formatting and spacing

**Bad Example:**
- No structure or headings
- No formatting
- Just plain text without organization

### Security Standards
- **NEVER** commit API keys or secrets to source control
- **NEVER** hardcode sensitive data - use environment variables (.env) for ALL sensitive data
- All sensitive data MUST be encrypted using AES-256 (see `src/shared/encryption.js`)
- Implement proper error handling to avoid leaking sensitive information in stack traces
- Validate and sanitize ALL user inputs before processing
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on all API endpoints
- Use HTTPS in production (already configured via Helmet.js)

```javascript
// ✅ GOOD: Using environment variables and encryption
import { encrypt, decrypt } from '../shared/encryption.js';

const apiKey = process.env.NDAX_API_KEY;
const encryptedData = encrypt(sensitiveUserData);
localStorage.setItem('userData', encryptedData);

// ❌ BAD: Hardcoded secrets, unencrypted storage
const apiKey = 'abc123-secret-key';
localStorage.setItem('userData', JSON.stringify(sensitiveUserData));
```

## Development Workflow

### Installation
```bash
npm install                          # Install Node.js dependencies
cd backend/python && pip install -r requirements.txt  # Install Python dependencies
```

### Running the Application
```bash
npm start                           # Start Node.js backend (port 3000)
npm run dev                         # Development mode
cd backend/python && python app.py  # Start Flask backend (port 5000)
```

### Testing
```bash
npm test                           # Run all tests
npm run test:coverage              # Run tests with coverage
```

**Testing Requirements:**
- Maintain >80% test coverage
- All new features MUST have corresponding tests
- Tests are located in `tests/` directory
- Use Jest for all JavaScript testing
- Tests use ES Modules with `--experimental-vm-modules` flag

### Linting
```bash
npm run lint                       # Check for linting errors
npm run lint:fix                   # Auto-fix linting errors
```

**Linting Requirements:**
- Fix all linting errors before committing
- Warnings are acceptable but should be minimized
- Follow ESLint rules defined in .eslintrc.json

## Module-Specific Guidelines

### Quantum Trading (`src/quantum/`)
- Implement quantum algorithms: superposition, entanglement, tunneling, interference
- Technical indicators: SMA, EMA, RSI, Bollinger Bands, MACD
- All trading functions should return standardized objects with `recommendation`, `confidence`, and relevant metrics

### Freelance Automation (`src/freelance/`)
- Each platform connector follows a consistent interface:
  - `authenticate()` - OAuth/API key authentication
  - `searchJobs(criteria)` - Job discovery
  - `submitProposal(jobId, proposal)` - Proposal submission
- AI modules (orchestrator, plagiarism checker) should be platform-agnostic

### AI Orchestration (`src/freelance/ai/`)
- Register models before use with `registerModel()`
- Support multiple model types (NLP, CV, etc.)
- Implement proper error handling for API failures

### Risk Management (`src/shared/riskManager.js`)
- Always evaluate trade risk before execution
- Enforce position size limits and daily loss limits
- Return structured risk assessment objects with `approved`, `reason`, and `metrics`

### UI Components (`src/components/`)
- Use React functional components
- Implement proper state management
- Follow existing component patterns (Wizard, Dashboard, etc.)
- **Component Structure:**
  ```jsx
  import React, { useState, useEffect } from 'react';
  
  export const ComponentName = ({ prop1, prop2 }) => {
    const [state, setState] = useState(initialValue);
    
    useEffect(() => {
      // Side effects here
    }, [dependencies]);
    
    const handleEvent = () => {
      // Event handler logic
    };
    
    return (
      <div className="component-name">
        {/* JSX content */}
      </div>
    );
  };
  ```
- **State Management:**
  - Use `useState` for local component state
  - Use `useEffect` for side effects and data fetching
  - Lift state up when multiple components need access
  - Avoid prop drilling - consider context for deeply nested data
- **Styling:**
  - Use CSS classes, not inline styles
  - Follow existing naming conventions (kebab-case for class names)
  - Keep styles in `/src/styles/` directory
- **Event Handlers:**
  - Prefix with `handle` (e.g., `handleClick`, `handleSubmit`)
  - Keep handlers close to where they're used
- **JSX Best Practices:**
  - Escape apostrophes: use `&apos;` instead of `'` in JSX text
  - Use semantic HTML elements
  - Add keys to list items
  - Keep JSX expressions simple and readable

## Environment Configuration

Required environment variables (see .env.example):
- Trading API keys (NDAX_API_KEY, NDAX_API_SECRET)
- Freelance platform credentials (UPWORK_CLIENT_ID, FIVERR_API_KEY, etc.)
- AI/ML service keys (OPENAI_API_KEY)
- Security keys (ENCRYPTION_KEY, JWT_SECRET)

## Compliance & Regulations

- Implement compliance checks based on region (US, EU, ASIA)
- Follow financial trading regulations
- Implement proper audit trails
- Enable crash recovery with automatic backups (30-minute intervals)

## API Endpoints

### Node.js Backend (Port 3000)
- `GET /api/health` - Health check
- `POST /api/trading/order` - Place trade order
- `POST /api/quantum/execute` - Execute quantum strategy
- `POST /api/ai/analyze` - AI analysis
- `POST /api/risk/check` - Risk assessment

### Flask Backend (Port 5000)
- `GET /api/health` - Health check
- `POST /api/trading/execute` - Execute trade
- `POST /api/quantum/strategy` - Run quantum strategy
- `POST /api/ai/predict` - AI prediction

## Best Practices

1. **Minimal Changes**: Make the smallest possible changes to address issues
2. **Test First**: Run existing tests before making changes to understand baseline
3. **Security First**: Always validate for security vulnerabilities
4. **Documentation**: Update README.md when adding significant new features
5. **Error Handling**: Implement comprehensive error handling with meaningful messages
6. **Performance**: Maintain performance targets:
   - Module loading: <100ms
   - API response: <200ms average
   - Quantum calculations: <50ms
   - Risk assessment: <10ms

## Common Tasks

### Adding a New Freelance Platform Connector
1. Create new file in `src/freelance/platforms/`
2. Implement standard interface (authenticate, searchJobs, submitProposal)
3. Add corresponding tests in `tests/modules/freelance.test.js`
4. Update API endpoint in backend/nodejs/server.js
5. Document API keys needed in .env.example

### Adding a New Quantum Strategy
1. Create function in `src/quantum/strategies.js`
2. Follow existing pattern: accept market data, return recommendation object
3. Add unit tests in `tests/modules/quantum.test.js`
4. Ensure performance <50ms

### Adding a New AI Model
1. Register with orchestrator using `registerModel()`
2. Define model type and capabilities
3. Implement task handler
4. Add tests for model integration

## Troubleshooting

- If tests fail with `MODULE_NOT_FOUND`: Run `npm install`
- If linting fails: Run `npm run lint:fix` to auto-fix issues
- If backend fails to start: Check .env file exists and has required variables
- For Python issues: Ensure `pip install -r backend/python/requirements.txt` was run

## Code Examples

### Good Practices

**Error Handling:**
```javascript
try {
  const result = await tradingEngine.executeOrder(order);
  return { success: true, data: result };
} catch (error) {
  logger.error('Order execution failed:', error);
  return { success: false, error: error.message };
}
```

**Function Design:**
```javascript
// ✅ Good: Clear, single responsibility, returns structured object
export const analyzeMarket = (marketData) => {
  const indicators = calculateIndicators(marketData);
  const signal = generateSignal(indicators);
  
  return {
    recommendation: signal.action,
    confidence: signal.strength,
    indicators: indicators,
    timestamp: Date.now()
  };
};
```

### Anti-Patterns to Avoid

```javascript
// ❌ Bad: Mixing concerns, unclear return value
export const doStuff = async (data) => {
  let result = processData(data);
  saveToDb(result);
  return result.value || null;
};

// ❌ Bad: Hardcoded values, no error handling
export const trade = () => {
  const amount = 1000;
  return axios.post('https://api.example.com/trade', { amount });
};
```

## Dependency Management

### Adding New Dependencies
1. Check if the dependency is necessary (prefer existing solutions)
2. Verify package is actively maintained and secure
3. Check for known vulnerabilities: `npm audit`
4. Add to appropriate section in package.json:
   - Production: `dependencies`
   - Development: `devDependencies`
5. Update package-lock.json: `npm install <package>`
6. Document in .env.example if configuration required

### Updating Dependencies
- Review changelog before updating
- Test thoroughly after updates
- Update one major version at a time
- Run full test suite after dependency updates

## Important Constraints

### What NOT to Do
- **Never** commit `.env` files or hardcode API keys/secrets in code
- **Never** modify working code unnecessarily - only change what's needed to fix the issue
- **Never** remove or disable existing tests without good reason
- **Never** bypass security features (encryption, authentication, rate limiting)
- **Never** make breaking changes to public APIs without version bump
- **Never** commit `node_modules/`, `dist/`, or other build artifacts (use .gitignore)
- **Never** use `console.log()` for production logging - use Winston logger
- **Never** make synchronous API calls in the main thread
- **Never** store sensitive data in localStorage without encryption

### Code Quality Standards
- All linting errors MUST be fixed before committing (warnings acceptable)
- Test coverage must remain above 80%
- All async operations must have proper error handling
- API endpoints must have rate limiting enabled
- All user inputs must be validated and sanitized

## Component Integration

### Architecture Overview
The application follows a modular architecture with clear separation of concerns:

```
Frontend (React) ↔ Node.js Backend (Express) ↔ External APIs
                          ↕
                   Python Backend (Flask)
                          ↕
                   Quantum/AI Modules
```

### Data Flow
1. **User Input** → React Components → State Management
2. **API Requests** → Axios → Node.js Backend → Risk Manager → Trading/Freelance APIs
3. **Quantum Calculations** → Node.js → Python Flask → Quantum Algorithms → Results
4. **AI Processing** → AI Orchestrator → External AI APIs → Plagiarism Check → Output

### State Management
- Frontend: React useState/useEffect hooks
- Backend: In-memory caching with configurable TTL
- Persistence: localStorage (frontend), file system (backend)
- Configuration: Centralized in `configManager` and `featureToggleManager`

### Communication Patterns
- **Frontend ↔ Backend**: REST API (JSON)
- **Node.js ↔ Python**: HTTP POST requests
- **Components**: Props drilling and callback functions
- **Events**: Custom event emitters for real-time updates

## Git Workflow

### Branch Strategy
- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features (e.g., `feature/add-binance-connector`)
- `bugfix/*` - Bug fixes (e.g., `bugfix/fix-risk-calculation`)
- `hotfix/*` - Critical production fixes

### Commit Conventions
Follow conventional commits format:
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(quantum): add interference strategy
fix(risk): correct position size calculation
docs(readme): update installation instructions
test(trading): add tests for order execution
```

### Pull Request Guidelines
1. Create feature branch from `develop`
2. Make minimal, focused changes
3. Ensure all tests pass and linting is clean
4. Update relevant documentation
5. Request review from maintainers
6. Squash commits before merging

## Wallet Management and Fund Retrieval

### Overview
The NDAX Quantum Engine includes comprehensive wallet management features for handling cryptocurrency wallets, retrieving funds, and managing blocked or stuck transactions. This section provides guidelines for implementing wallet-related functionality.

### Wallet Architecture

**Key Components:**
- `src/shared/blockchainManager.js` - Web3 integration for Ethereum-based wallets
- `src/shared/ethereumValidator.js` - Ethereum address validation utilities
- `platform/ndax_live.py` - NDAX exchange wallet integration
- `platform/ndax_test.py` - Test/paper trading wallet simulation
- `scan_wallets.py` - Multi-chain wallet scanning utility (BTC, TRON)

### Wallet Operations

#### 1. Wallet Connection and Validation

**Always validate wallet addresses before operations:**

```javascript
// ✅ GOOD: Validate before using
import { validateEthereumAddress } from '../shared/ethereumValidator.js';

const processWallet = async (address) => {
  const validation = validateEthereumAddress(address);
  
  if (!validation.isValid) {
    throw new Error(`Invalid wallet address: ${validation.error}`);
  }
  
  // Use normalized address for consistency
  const normalizedAddress = validation.address;
  return await performWalletOperation(normalizedAddress);
};

// ❌ BAD: No validation, inconsistent case handling
const processWallet = async (address) => {
  return await performWalletOperation(address); // Might fail on invalid input
};
```

#### 2. Balance Retrieval

**Implement proper error handling and retry logic:**

```javascript
// ✅ GOOD: With retry logic and proper error handling
const getWalletBalance = async (address, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const balance = await blockchain.getBalance(address);
      logger.info(`Retrieved balance for ${address}: ${balance} ETH`);
      return { success: true, balance, address };
    } catch (error) {
      lastError = error;
      logger.warn(`Balance retrieval attempt ${attempt}/${maxRetries} failed: ${error.message}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 2^attempt seconds
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return { 
    success: false, 
    error: `Failed after ${maxRetries} attempts: ${lastError.message}`,
    address 
  };
};

// ❌ BAD: No error handling or retry logic
const getWalletBalance = async (address) => {
  const balance = await blockchain.getBalance(address); // Fails on network issues
  return balance;
};
```

**NDAX Exchange Balance Retrieval:**

```python
# ✅ GOOD: NDAX balance with proper error handling
from platform.ndax_live import NDAXLiveClient
import logging

def retrieve_ndax_balance(retry_count=3):
    """
    Retrieve NDAX account balances with retry logic
    
    Returns:
        dict: Balances by currency or error information
    """
    client = NDAXLiveClient()
    last_error = None
    
    for attempt in range(1, retry_count + 1):
        try:
            balances = client.get_balance()
            logging.info(f"Retrieved NDAX balances: {len(balances)} currencies")
            return {'success': True, 'balances': balances}
        except requests.RequestException as e:
            last_error = str(e)
            logging.warning(f"Balance retrieval attempt {attempt}/{retry_count} failed: {e}")
            if attempt < retry_count:
                time.sleep(2 ** attempt)  # Exponential backoff
    
    return {
        'success': False,
        'error': f'Failed after {retry_count} attempts: {last_error}'
    }
```

#### 3. Blocked/Stuck Funds Handling

**Identifying Blocked Funds:**

Funds can become blocked or stuck due to:
- Pending transactions with insufficient gas fees
- Network congestion
- Failed smart contract interactions
- Exchange withdrawal delays
- Incorrect transaction parameters

**Detection Strategy:**

```javascript
// ✅ GOOD: Comprehensive blocked funds detection
export const detectBlockedFunds = async (address) => {
  const issues = [];
  
  try {
    // Check for pending transactions
    const pendingTxs = await getPendingTransactions(address);
    if (pendingTxs.length > 0) {
      issues.push({
        type: 'PENDING_TRANSACTIONS',
        count: pendingTxs.length,
        transactions: pendingTxs,
        severity: 'warning'
      });
    }
    
    // Check for failed transactions in last 24 hours
    const recentFailures = await getFailedTransactions(address, 24);
    if (recentFailures.length > 0) {
      issues.push({
        type: 'FAILED_TRANSACTIONS',
        count: recentFailures.length,
        transactions: recentFailures,
        severity: 'high'
      });
    }
    
    // Check for stuck transactions (pending > 1 hour)
    const stuckTxs = pendingTxs.filter(tx => 
      Date.now() - tx.timestamp > 3600000
    );
    if (stuckTxs.length > 0) {
      issues.push({
        type: 'STUCK_TRANSACTIONS',
        count: stuckTxs.length,
        transactions: stuckTxs,
        severity: 'critical',
        recommendation: 'Consider gas price increase or transaction replacement'
      });
    }
    
    return { success: true, issues, hasBlockedFunds: issues.length > 0 };
  } catch (error) {
    logger.error('Error detecting blocked funds:', error);
    return { success: false, error: error.message };
  }
};
```

**Recovery Strategies:**

```javascript
// ✅ GOOD: Multiple recovery strategies for stuck transactions
export const recoverBlockedFunds = async (txHash, strategy = 'auto') => {
  try {
    const tx = await blockchain.getTransactionReceipt(txHash);
    
    // If transaction is still pending
    if (!tx || !tx.blockNumber) {
      logger.info(`Transaction ${txHash} is pending, attempting recovery...`);
      
      switch (strategy) {
        case 'speed_up':
          // Increase gas price and resubmit
          return await speedUpTransaction(txHash);
          
        case 'cancel':
          // Send 0 ETH transaction to same nonce to cancel
          return await cancelTransaction(txHash);
          
        case 'replace':
          // Replace with new transaction with higher gas
          return await replaceTransaction(txHash);
          
        case 'auto':
          // Automatically choose best strategy based on conditions
          const gasPrice = await blockchain.provider.request({
            method: 'eth_gasPrice',
            params: []
          });
          const currentGasPrice = parseInt(gasPrice, 16);
          
          // If network is congested (high gas), wait
          if (currentGasPrice > 100e9) { // > 100 Gwei
            logger.info('Network congested, waiting for gas prices to decrease');
            return { 
              success: false, 
              action: 'wait',
              message: 'Network congestion detected, retry later' 
            };
          }
          
          // Otherwise, speed up transaction
          return await speedUpTransaction(txHash);
          
        default:
          throw new Error(`Unknown recovery strategy: ${strategy}`);
      }
    }
    
    // Transaction is confirmed, check if successful
    if (tx.status === '0x1') {
      return { 
        success: true, 
        message: 'Transaction already confirmed successfully' 
      };
    } else {
      return { 
        success: false, 
        message: 'Transaction failed on-chain',
        recommendation: 'Review transaction parameters and try again'
      };
    }
  } catch (error) {
    logger.error('Error recovering blocked funds:', error);
    return { 
      success: false, 
      error: error.message,
      recommendation: 'Contact support if issue persists'
    };
  }
};

// Helper: Speed up transaction with higher gas price
const speedUpTransaction = async (txHash) => {
  const originalTx = await getTransactionDetails(txHash);
  const newGasPrice = Math.floor(originalTx.gasPrice * 1.2); // 20% increase
  
  const newTx = {
    ...originalTx,
    gasPrice: newGasPrice,
    nonce: originalTx.nonce // Same nonce to replace
  };
  
  const newTxHash = await blockchain.sendTransaction(
    newTx.to,
    newTx.value,
    newTx.data
  );
  
  logger.info(`Sped up transaction: ${txHash} -> ${newTxHash}`);
  return { success: true, oldTxHash: txHash, newTxHash };
};
```

**NDAX Exchange Withdrawal Handling:**

```python
# ✅ GOOD: NDAX withdrawal with status monitoring
def handle_ndax_withdrawal(amount, currency, address, timeout_minutes=30):
    """
    Handle NDAX withdrawal with status monitoring
    
    Args:
        amount: Amount to withdraw
        currency: Currency symbol (e.g., 'BTC', 'ETH')
        address: Destination wallet address
        timeout_minutes: Max time to wait for confirmation
    
    Returns:
        dict: Withdrawal status and details
    """
    client = NDAXLiveClient()
    
    try:
        # Initiate withdrawal
        withdrawal = client.withdraw(amount, currency, address)
        withdrawal_id = withdrawal.get('WithdrawalId')
        
        if not withdrawal_id:
            return {
                'success': False,
                'error': 'Failed to initiate withdrawal',
                'details': withdrawal
            }
        
        # Monitor withdrawal status
        start_time = time.time()
        max_wait = timeout_minutes * 60
        
        while time.time() - start_time < max_wait:
            status = client.get_withdrawal_status(withdrawal_id)
            state = status.get('State', 'Unknown')
            
            if state == 'Completed':
                return {
                    'success': True,
                    'withdrawal_id': withdrawal_id,
                    'state': state,
                    'tx_hash': status.get('TxHash')
                }
            elif state in ['Failed', 'Rejected', 'Cancelled']:
                return {
                    'success': False,
                    'withdrawal_id': withdrawal_id,
                    'state': state,
                    'error': status.get('ErrorMessage', 'Withdrawal failed')
                }
            elif state == 'Pending':
                logging.info(f"Withdrawal {withdrawal_id} pending, waiting...")
                time.sleep(30)  # Check every 30 seconds
            else:
                logging.warning(f"Unknown withdrawal state: {state}")
                time.sleep(30)
        
        # Timeout reached
        return {
            'success': False,
            'withdrawal_id': withdrawal_id,
            'error': f'Withdrawal timeout after {timeout_minutes} minutes',
            'recommendation': 'Check NDAX account or contact support'
        }
        
    except Exception as e:
        logging.error(f"Withdrawal error: {e}")
        return {
            'success': False,
            'error': str(e)
        }
```

#### 4. Multi-Chain Wallet Scanning

**Use the scan_wallets.py utility for multi-chain operations:**

```python
# Example: Scan multiple wallets across Bitcoin and TRON
from scan_wallets import get_btc_info, get_tron_info

def scan_all_wallets(wallet_addresses):
    """
    Scan multiple wallets across different blockchains
    
    Args:
        wallet_addresses: Dict of {chain: [addresses]}
    
    Returns:
        dict: Comprehensive wallet scan results
    """
    results = {
        'bitcoin': [],
        'tron': [],
        'errors': []
    }
    
    # Scan Bitcoin wallets
    for btc_address in wallet_addresses.get('bitcoin', []):
        try:
            info = get_btc_info(btc_address)
            if 'error' not in info:
                results['bitcoin'].append(info)
            else:
                results['errors'].append({
                    'chain': 'bitcoin',
                    'address': btc_address,
                    'error': info['error']
                })
        except Exception as e:
            results['errors'].append({
                'chain': 'bitcoin',
                'address': btc_address,
                'error': str(e)
            })
    
    # Scan TRON wallets
    for tron_address in wallet_addresses.get('tron', []):
        try:
            info = get_tron_info(tron_address)
            if 'error' not in info:
                results['tron'].append(info)
            else:
                results['errors'].append({
                    'chain': 'tron',
                    'address': tron_address,
                    'error': info['error']
                })
        except Exception as e:
            results['errors'].append({
                'chain': 'tron',
                'address': tron_address,
                'error': str(e)
            })
    
    return results
```

### Best Practices for Wallet Operations

1. **Always validate addresses** before performing operations
2. **Implement retry logic** with exponential backoff for network operations
3. **Log all wallet operations** for audit trails
4. **Never hardcode wallet addresses or private keys** - use environment variables
5. **Use normalized addresses** (lowercase for Ethereum) for consistency
6. **Monitor gas prices** before submitting transactions
7. **Implement timeout mechanisms** for long-running operations
8. **Provide clear error messages** with recovery recommendations
9. **Test thoroughly** on testnets before using real funds
10. **Implement rate limiting** to avoid API throttling

### Security Considerations

- **Never expose private keys** in logs, error messages, or client-side code
- **Always use HTTPS** for API calls involving wallet data
- **Encrypt sensitive data** using `src/shared/encryption.js` (AES-256)
- **Implement IP whitelisting** for exchange API keys when possible
- **Use read-only API keys** for balance checking operations
- **Validate all user inputs** to prevent injection attacks
- **Implement multi-factor authentication** for withdrawal operations
- **Monitor for suspicious activity** (unusual transaction patterns, large withdrawals)
- **Keep dependencies updated** to patch security vulnerabilities
- **Use hardware wallets** for storing large amounts of cryptocurrency

### Error Handling Patterns

```javascript
// ✅ GOOD: Comprehensive error handling with user-friendly messages
export const handleWalletError = (error, operation) => {
  logger.error(`Wallet operation failed: ${operation}`, error);
  
  // Categorize error and provide specific guidance
  if (error.code === 4001) {
    return {
      success: false,
      userMessage: 'Transaction rejected by user',
      technicalMessage: error.message,
      action: 'retry',
      category: 'user_rejection'
    };
  } else if (error.code === -32603) {
    return {
      success: false,
      userMessage: 'Network error occurred. Please check your connection and try again.',
      technicalMessage: error.message,
      action: 'retry',
      category: 'network_error'
    };
  } else if (error.message.includes('insufficient funds')) {
    return {
      success: false,
      userMessage: 'Insufficient funds to complete transaction',
      technicalMessage: error.message,
      action: 'add_funds',
      category: 'insufficient_balance'
    };
  } else if (error.message.includes('gas')) {
    return {
      success: false,
      userMessage: 'Gas fee estimation failed. Network may be congested.',
      technicalMessage: error.message,
      action: 'wait_and_retry',
      category: 'gas_error'
    };
  } else {
    return {
      success: false,
      userMessage: 'An unexpected error occurred. Please try again or contact support.',
      technicalMessage: error.message,
      action: 'contact_support',
      category: 'unknown_error'
    };
  }
};
```

### Testing Wallet Functionality

Always test wallet operations thoroughly:

```javascript
// Example test for wallet balance retrieval
describe('Wallet Balance Retrieval', () => {
  it('should retrieve balance for valid address', async () => {
    const testAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    const result = await getWalletBalance(testAddress);
    
    expect(result.success).toBe(true);
    expect(result.balance).toBeGreaterThanOrEqual(0);
    expect(result.address).toBe(testAddress.toLowerCase());
  });
  
  it('should handle invalid address gracefully', async () => {
    const invalidAddress = 'invalid_address';
    await expect(getWalletBalance(invalidAddress)).rejects.toThrow('Invalid wallet address');
  });
  
  it('should retry on network failure', async () => {
    // Mock network failure then success
    const result = await getWalletBalance(testAddress, 3);
    expect(result.success).toBe(true);
  });
});
```

## Additional Resources

- See `docs/` directory for detailed setup guides
- `docs/API.md` - Complete API documentation
- `docs/QUICK_START.md` - Quick start guide
- `docs/API_SETUP_GUIDE.md` - API key configuration
- `NDAX_TRADING_SETUP.md` - NDAX wallet integration guide
- `scan_wallets.py` - Multi-chain wallet scanning utility

## Version Information

- **Node.js**: 18+ required
- **Python**: 3.8+ required
- **React**: 18.2.0
- **Express**: 5.1.0
- **Jest**: 29.7.0
- **ESLint**: 8.x
