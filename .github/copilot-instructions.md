---
name: NDAX-Quantum-Engine-Instructions
description: Comprehensive development guidelines for the NDAX Quantum Engine project
applyTo:
  - "**/*"
---

> **⚠️ NOTICE:** This file has been moved to `.github/instructions/coding-standards.instructions.md` following GitHub's latest best practices.
> 
> This file is kept for backward compatibility but may be removed in the future. Please refer to the new location.
>
> **Update (2025-11-24):** The `applyTo` directive has been updated to include all file types (`**/*`) to ensure Copilot can review bash scripts, markdown files, YAML configurations, and all other project files.
>
> **Update (2025-12-29):** Added comprehensive **Wallet Management and Fund Retrieval** section covering:
> - Wallet connection and validation procedures
> - Balance retrieval with retry logic
> - Blocked/stuck funds detection and recovery strategies
> - Multi-chain wallet scanning (Bitcoin, TRON, Ethereum)
> - NDAX exchange withdrawal handling
> - Security best practices for wallet operations
> - Error handling patterns and testing guidelines

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

## Additional Resources

- See `docs/` directory for detailed setup guides
- `docs/API.md` - Complete API documentation
- `docs/QUICK_START.md` - Quick start guide
- `docs/API_SETUP_GUIDE.md` - API key configuration

## Version Information

- **Node.js**: 18+ required
- **Python**: 3.8+ required
- **React**: 18.2.0
- **Express**: 5.1.0
- **Jest**: 29.7.0
- **ESLint**: 8.x
