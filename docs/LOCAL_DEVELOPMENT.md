# Local Development Guide

## Prerequisites

Before starting local development, ensure you have:

- **Node.js** 18.x or 20.x ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **Git** ([Download](https://git-scm.com/downloads))
- **Docker** (optional, for containerized development) ([Download](https://www.docker.com/get-started))
- **VS Code** or your preferred IDE (recommended extensions below)

## Quick Start

### 1. Clone Repository

```bash
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine
```

### 2. Install Dependencies

#### Node.js Dependencies
```bash
npm install
```

#### Python Dependencies
```bash
cd backend/python
pip install -r requirements.txt
cd ../..
```

### 3. Environment Configuration

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your configuration
# At minimum, set:
# - DEMO_MODE=true (for testing without real APIs)
# - ENCRYPTION_KEY (generate with: openssl rand -base64 32)
# - JWT_SECRET (generate with: openssl rand -base64 32)
```

### 4. Start Development Servers

#### Option A: Run All Services with Docker Compose
```bash
docker-compose up
```

This starts:
- Frontend (Vite dev server) - http://localhost:5173
- Node.js backend - http://localhost:3000
- Python backend - http://localhost:5000
- Redis - localhost:6379
- PostgreSQL - localhost:5432

#### Option B: Run Services Individually

**Terminal 1 - Frontend:**
```bash
npm run dev
# Opens at http://localhost:5173
```

**Terminal 2 - Node.js Backend:**
```bash
npm run server
# Runs at http://localhost:3000
```

**Terminal 3 - Python Backend:**
```bash
python backend/unified_backend.py
# or
cd backend && python unified_backend.py
# Runs at http://localhost:5000
```

#### Option C: Run Frontend + Node.js Backend Together
```bash
npm run dev:full
# Runs both Vite and Express concurrently
```

## Development Workflow

### Project Structure

```
ndax-quantum-engine/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── lib/               # Utility libraries (API client)
│   ├── quantum/           # Quantum trading logic
│   ├── freelance/         # Freelance automation
│   ├── shared/            # Shared utilities
│   └── styles/            # CSS styles
│
├── backend/
│   ├── nodejs/            # Express backend
│   │   └── server.js
│   ├── python/            # Flask backend
│   │   └── app.py
│   └── unified_backend.py # Main Python API
│
├── core/                  # Core engines
│   ├── trading_engine.py
│   └── quantum_engine.py
│
├── data/                  # Data management
│   ├── market_data.py
│   ├── position_tracker.py
│   └── historical_data.py
│
├── tests/                 # Test files
│   ├── modules/           # Unit tests
│   └── stress/            # Stress tests
│
├── docs/                  # Documentation
├── aws/                   # AWS deployment configs
└── .github/workflows/     # CI/CD pipelines
```

### Making Changes

#### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### 2. Make Your Changes

- Follow the coding standards in `.github/instructions/coding-standards.instructions.md`
- Write tests for new features
- Update documentation if needed

#### 3. Run Linter

```bash
npm run lint

# Auto-fix issues
npm run lint:fix
```

#### 4. Run Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/modules/quantum.test.js
```

#### 5. Commit Changes

```bash
git add .
git commit -m "feat: add your feature description"

# Follow conventional commit format:
# feat: new feature
# fix: bug fix
# docs: documentation changes
# test: adding tests
# refactor: code refactoring
# chore: maintenance tasks
```

## TypeScript Development

### Type Checking

```bash
# Check types without emitting files
npx tsc --noEmit
```

### Using the API Client

```typescript
import api from '@/lib/api';

// Health check
const health = await api.getHealth();
console.log(health.data);

// Execute trade
const trade = await api.executeTrade({
  symbol: 'BTC/USD',
  side: 'BUY',
  quantity: 0.01,
  orderType: 'MARKET'
});

if (trade.success) {
  console.log('Trade executed:', trade.data);
} else {
  console.error('Trade failed:', trade.error);
}

// Quantum analysis
const analysis = await api.performQuantumAnalysis({
  strategyType: 'superposition',
  symbol: 'BTC/USD',
  marketData: { prices: [50000, 50100, 50200] }
});
```

## Testing

### Running Tests

```bash
# All tests
npm test

# Watch mode (re-runs on file changes)
npm test -- --watch

# Specific test file
npm test -- tests/modules/quantum.test.js

# Coverage report
npm run test:coverage
```

### Writing Tests

```javascript
// tests/modules/yourmodule.test.js
import { describe, it, expect } from '@jest/globals';
import { yourFunction } from '../../src/your-module.js';

describe('Your Module', () => {
  it('should do something', () => {
    const result = yourFunction('input');
    expect(result).toBe('expected output');
  });
});
```

## Debugging

### VS Code Debugging

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Node.js Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/nodejs/server.js",
      "env": {
        "NODE_ENV": "development"
      }
    },
    {
      "type": "chrome",
      "request": "launch",
      "name": "Debug Frontend",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### Browser DevTools

- Press `F12` to open DevTools
- Use Console tab for logging
- Use Network tab to inspect API calls
- Use React DevTools extension for component inspection

### Backend Logging

Logs are written to:
- Node.js: Console and `./logs/` directory
- Python: Console and `./data/logs/` directory

Enable debug logging:
```bash
# In .env
LOG_LEVEL=debug
```

## Environment Variables

### Required Variables

```bash
# Application Mode
DEMO_MODE=true              # Use demo mode for development
NODE_ENV=development
FLASK_ENV=development

# Backend Ports
PORT=3000                   # Node.js backend
FLASK_PORT=5000            # Python backend

# Security (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=your-32-char-key
JWT_SECRET=your-jwt-secret
FLASK_SECRET_KEY=your-flask-secret

# Frontend
VITE_API_URL=http://localhost:3000
VITE_PYTHON_API_URL=http://localhost:5000
VITE_DEMO_MODE=true
```

### Optional Variables

```bash
# Trading (only needed for live trading)
NDAX_API_KEY=your-api-key
NDAX_API_SECRET=your-api-secret
NDAX_USER_ID=your-user-id

# AI Services (optional)
OPENAI_API_KEY=your-openai-key

# Database (optional)
DATABASE_URL=postgresql://user:password@localhost:5432/ndax
REDIS_URL=redis://localhost:6379

# Risk Management
MAX_POSITION_SIZE=10000
MAX_DAILY_LOSS=1000
RISK_LEVEL=moderate
```

## Database Setup (Optional)

### PostgreSQL

```bash
# Using Docker
docker run --name ndax-postgres \
  -e POSTGRES_DB=ndax_quantum \
  -e POSTGRES_USER=ndax \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 \
  -d postgres:15-alpine

# Or install locally and create database
createdb ndax_quantum
```

### Redis

```bash
# Using Docker
docker run --name ndax-redis \
  -p 6379:6379 \
  -d redis:7-alpine

# Or install locally
brew install redis  # macOS
redis-server
```

## Hot Reload

### Frontend (Vite)
- Automatically reloads on file changes
- Fast HMR (Hot Module Replacement)

### Node.js Backend
- Install nodemon for auto-restart:
```bash
npm install --save-dev nodemon

# Update package.json script
"dev:server": "nodemon backend/nodejs/server.js"
```

### Python Backend
- Install watchdog for auto-reload:
```bash
pip install watchdog

# Run with auto-reload
FLASK_ENV=development python backend/unified_backend.py
```

## Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "ms-python.vscode-pylance",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ritwickdey.liveserver"
  ]
}
```

## Common Issues

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run server
```

### Module Not Found

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Python Import Errors

```bash
# Ensure you're in correct directory
cd backend

# Or set PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

### TypeScript Errors

```bash
# Clear TypeScript cache
npx tsc --build --clean

# Reinstall type definitions
npm install --save-dev @types/node @types/react @types/react-dom
```

## Performance Profiling

### Frontend Performance

```javascript
// Use React DevTools Profiler
import { Profiler } from 'react';

<Profiler id="Dashboard" onRender={(id, phase, actualDuration) => {
  console.log(`${id} rendered in ${actualDuration}ms`);
}}>
  <Dashboard />
</Profiler>
```

### Backend Performance

```javascript
// Add timing middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## Building for Production

```bash
# Build frontend
npm run build

# Output in dist/ directory
# Serves from backend/nodejs/server.js
```

## Git Workflow

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes and commit
git add .
git commit -m "feat: my feature"

# 3. Push to remote
git push origin feature/my-feature

# 4. Create Pull Request on GitHub

# 5. After review and merge, update local main
git checkout main
git pull origin main

# 6. Delete feature branch
git branch -d feature/my-feature
```

## Getting Help

- **Documentation**: Check `docs/` directory
- **Issues**: Create GitHub issue
- **Logs**: Check console output and log files
- **Tests**: Run tests to verify functionality

## Next Steps

- Read [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Read [AWS_DEPLOYMENT.md](AWS_DEPLOYMENT.md) for deployment
- Check coding standards in `.github/instructions/`
- Explore example components in `src/components/`
