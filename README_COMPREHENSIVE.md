# NDAX Quantum Engine - Comprehensive Guide

## Overview

NDAX Quantum Engine is a unified modular platform for **Quantum Trading** and **AI Freelance Automation** with an advanced feature toggle system, runtime optimization, AI-powered conversational interface, and comprehensive **Task Management**.

## 🚀 Key Features

### 1. **Feature Toggle System**
Control every major feature of the application through an intuitive settings interface or configuration files.

**Available Features:**
- 🤖 **AI Bot** - Automated trading and freelance assistance
- 🧙 **Wizard Pro** - Natural language conversational setup
- 🧪 **Stress Test** - Performance and load testing
- 📝 **Strategy Management** - Trading strategy editor
- ✅ **To-Do List** - Task management with localStorage persistence
- ⚛️ **Quantum Engine** - Quantum trading algorithms
- 💼 **Freelance Automation** - Multi-platform job search
- 🔬 **Test Lab** - Strategy testing environment
- 📊 **Advanced Analytics** - Detailed reporting
- ⚠️ **Risk Management** - Risk assessment tools
- 🔄 **Auto Recovery** - Crash recovery and backups
- ✓ **Compliance Checks** - Regulatory monitoring

### 2. **Task Manager (To-Do List)** 📝

A comprehensive task management system integrated into the NDAX Quantum Engine dashboard.

#### Features
- ✅ **Full CRUD Operations** - Create, Read, Update, Delete tasks
- 💾 **localStorage Persistence** - No backend required, works offline
- 🔑 **UUID-based Keys** - Unique identifiers using crypto.randomUUID()
- 🎯 **Filter Views** - All, Active, and Completed tabs
- 📊 **Statistics Dashboard** - Real-time task counts
- ✏️ **Inline Editing** - Quick task updates with keyboard shortcuts
- ⌨️ **Keyboard Navigation** - Enter to save, Escape to cancel
- ♿ **Accessibility** - Full ARIA labels and keyboard support
- 📱 **Mobile Responsive** - Optimized for all screen sizes
- 🎨 **Consistent Styling** - Integrated with existing CSS framework
- ⚠️ **Error Handling** - Validation and user-friendly error messages
- 🧹 **Bulk Actions** - Clear all completed tasks at once

#### Usage

1. **Access Task Manager**
   - Navigate to Dashboard
   - Click on "Task Manager" module card
   - Or use feature toggle: `todoList: true` (enabled by default)

2. **Add a Task**
   - Enter task description in the input field
   - Click "Add Task" or press Enter
   - Tasks support up to 500 characters

3. **Manage Tasks**
   - ☑️ Check/uncheck to mark complete/incomplete
   - ✏️ Click edit button to modify task text
   - 🗑️ Click delete button to remove task
   - Use keyboard shortcuts: Enter (save), Escape (cancel)

4. **Filter Tasks**
   - **All** - View all tasks
   - **Active** - View incomplete tasks only
   - **Completed** - View completed tasks only

5. **Clear Completed**
   - Click "Clear Completed" button to remove all finished tasks

#### Technical Details

**Data Storage:**
- Uses browser localStorage with key: `ndax-quantum-todos`
- Data structure:
  ```javascript
  {
    id: "uuid-v4-string",
    text: "Task description",
    completed: boolean,
    createdAt: "ISO-8601-timestamp",
    updatedAt: "ISO-8601-timestamp"
  }
  ```

**Validation:**
- Task text cannot be empty (after trimming)
- Maximum length: 500 characters
- Automatic localStorage quota error handling

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus management for edit mode
- Role attributes for semantic structure

#### Screenshots

**Desktop View:**
![Task Manager - Desktop View](https://github.com/user-attachments/assets/94328cfa-39be-4dca-9540-2bf243861847)

**Mobile View:**
![Task Manager - Mobile View](https://github.com/user-attachments/assets/a8d43eb1-c65e-41ad-a68d-f0a9eb7d50be)

### 3. **Runtime Modes**
Optimize performance and UI for different environments:

#### **Mobile Mode** 📱
- Touch-optimized interface
- Dimmed theme for battery saving
- Reduced resource usage
- Limited concurrent tasks (2)
- Longer polling intervals (5s)
- Disabled animations

#### **Regular Mode** 💻
- Full desktop experience
- Standard performance
- All features enabled
- Moderate resource usage
- 5 concurrent tasks
- Normal polling (3s)

#### **Cloud/Server Mode** ☁️
- Maximum performance
- High throughput
- 20 concurrent tasks
- Fastest polling (1s)
- Optimized for headless operation
- No UI animations

### 3. **Wizard Pro - AI Assistant** 🧙

Natural language conversational interface for setup and configuration.

**Capabilities:**
- Natural language understanding
- Context-aware responses
- Entity extraction (API keys, amounts, percentages, etc.)
- Intent detection (setup, trading, freelance, help, etc.)
- Command translation to actions
- Conversation history and export
- Context sharing with AI bot

**Example Commands:**
```
"Set up trading with moderate risk"
"I want to trade Bitcoin with $5000 max position"
"Connect to Upwork and Fiverr"
"Set maximum daily loss to $1000"
"Enable AI assistance for all features"
```

### 4. **Configuration Management**

#### Settings UI
Access via Dashboard → Settings

**Tabs:**
1. **Feature Toggles** - Enable/disable features
2. **Runtime Mode** - Select mobile/regular/cloud
3. **General** - API URL, theme, notifications
4. **Trading** - Risk levels, position limits
5. **Import/Export** - Backup and restore settings

#### Configuration Files
Location: `config/app-config.json`

**Persistence:**
- LocalStorage (browser)
- Config files (backend)
- JSON export/import

## 📋 Installation

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+ (optional, for Python backend)

### Setup

```bash
# Clone repository
git clone https://github.com/oconnorw225-del/ndax-quantum-engine.git
cd ndax-quantum-engine

# Install dependencies
npm install

# Optional: Install Python dependencies
cd backend/python
pip install -r requirements.txt
cd ../..

# Create environment file
cp .env.example .env
# Edit .env with your API keys

# Start development server
npm run dev:full

# Or start separately:
# Frontend: npm run dev
# Backend: npm run server
```

## 🎯 Quick Start

### Option 1: Standard Wizard
1. Run `npm run dev:full`
2. Navigate to `http://localhost:5173`
3. Complete the setup wizard
4. Configure API keys and preferences
5. Launch dashboard

### Option 2: Wizard Pro (AI Assistant)
1. Access Dashboard
2. Click "Wizard Pro"
3. Chat naturally: "I want to set up trading"
4. AI extracts settings and configures automatically
5. Review and launch

### Option 3: Direct Configuration
1. Go to Dashboard → Settings
2. Configure features, runtime mode, and preferences
3. Save configuration
4. Start using enabled features

## 📖 Usage Guide

### Trading Setup

1. **Enable Quantum Engine** (Settings → Feature Toggles)
2. **Configure API Keys** (Wizard Pro or Settings)
3. **Set Risk Parameters:**
   - Risk Level: Conservative/Moderate/Aggressive
   - Max Position Size: Dollar amount
   - Max Daily Loss: Dollar amount
4. **Select Trading Pair** (BTC/USD, ETH/USD, etc.)
5. **Choose Strategy** (Superposition, Entanglement, Tunneling, Interference)
6. **Execute Trades** from Quantum Engine module

### Freelance Automation Setup

1. **Enable Freelance Automation** (Settings → Feature Toggles)
2. **Connect Platforms:**
   - Upwork (OAuth or API key)
   - Fiverr (API key)
   - Freelancer (Token)
   - Toptal, Guru, PeoplePerHour (API keys)
3. **Set Job Criteria:**
   - Keywords
   - Minimum budget
   - Category filters
4. **Enable AI Assistance** for auto-generated proposals
5. **Search and Apply** from Freelance Automation module

### Feature Toggles

**Via Settings UI:**
1. Dashboard → Settings
2. Feature Toggles tab
3. Click checkboxes to enable/disable
4. Changes save automatically

**Via Configuration File:**
```json
{
  "features": {
    "aiBot": true,
    "wizardPro": true,
    "stressTest": false,
    "strategyManagement": true,
    "todoList": true
  }
}
```

**Via API:**
```bash
# Get features
curl http://localhost:3000/api/features

# Update features
curl -X POST http://localhost:3000/api/features \
  -H "Content-Type: application/json" \
  -d '{"aiBot": true, "wizardPro": true}'
```

### Runtime Mode Optimization

**Auto-Detection:**
- Automatically detects mobile devices
- Checks screen size and touch capability
- Selects appropriate mode

**Manual Override:**
```javascript
// In browser console or Settings UI
configManager.setRuntimeMode('mobile'); // or 'regular' or 'cloud'
```

**Optimizations by Mode:**

| Feature | Mobile | Regular | Cloud |
|---------|--------|---------|-------|
| Max Tasks | 2 | 5 | 20 |
| Polling | 5s | 3s | 1s |
| Animations | Off | On | Off |
| Cache | 5 min | 3 min | 1 min |
| Chart Points | 50 | 200 | 1000 |

### Test Lab

1. **Enable Test Lab** (Settings → Feature Toggles)
2. **Select Test Type:**
   - Strategy Test - Validate trading strategies
   - Stress Test - Performance testing
   - API Test - Endpoint validation
3. **Configure Parameters:**
   - Duration (seconds)
   - Iterations
   - Concurrency (stress test only)
4. **Run Test** and review results

## 🔧 API Endpoints

### Health & Status
```
GET  /api/health          - Health check
GET  /api/stats           - System statistics
```

### Configuration
```
GET  /api/config/load     - Load configuration
POST /api/config/save     - Save configuration
GET  /api/features        - Get feature toggles
POST /api/features        - Update feature toggles
GET  /api/runtime         - Get runtime mode
POST /api/runtime         - Set runtime mode
```

### Trading
```
POST /api/quantum/execute - Execute quantum strategy
POST /api/quantum/strategy - Run strategy
POST /api/trading/order   - Place order
POST /api/trading/execute - Execute trade
POST /api/risk/check      - Check trade risk
```

### Freelance
```
POST /api/freelance/:platform/jobs  - Search jobs
POST /api/freelance/:platform/apply - Submit application
```

### AI
```
POST /api/ai/analyze      - Analyze data
POST /api/ai/predict      - Make predictions
```

### Testing
```
POST /api/test/:type      - Run test (strategy/stress/api)
```

## 🛠️ Troubleshooting

### Dashboard Not Loading
1. Check backend is running: `npm run server`
2. Verify API URL in Settings or `.env`
3. Check browser console for errors
4. Clear localStorage: `localStorage.clear()`

### Missing Modules
1. Go to Settings → Feature Toggles
2. Enable required features
3. Refresh dashboard
4. Check runtime mode restrictions

### API Connection Issues
1. Verify backend is running on port 3000
2. Check CORS configuration
3. Validate API keys in `.env`
4. Check firewall/network settings

### Performance Issues
1. Switch to appropriate runtime mode
2. Disable unnecessary features
3. Reduce polling intervals
4. Clear browser cache

### Mobile Display Problems
1. Ensure mobile mode is auto-detected
2. Manually switch to mobile mode in Settings
3. Check viewport meta tag in HTML
4. Verify touch optimization is enabled

## 🔐 Security

### API Keys
- Stored encrypted with AES-256
- Never committed to source control
- Use `.env` file for local development
- Environment variables for production

### Data Protection
- All sensitive data encrypted
- HTTPS required for production
- Rate limiting on API endpoints
- JWT authentication for protected routes

### Best Practices
1. Rotate API keys regularly
2. Use separate keys for development/production
3. Enable two-factor authentication
4. Review audit logs
5. Keep dependencies updated

## 📊 Performance Metrics

### Target Benchmarks
- Module loading: <100ms
- API response: <200ms average
- Quantum calculations: <50ms
- Risk assessment: <10ms
- UI render: <16ms (60fps)

### Monitoring
Access real-time metrics via:
1. Dashboard analytics (if enabled)
2. Backend logs
3. Browser DevTools Performance tab

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm test:coverage

# Run linting
npm run lint

# Fix linting issues
npm run lint:fix
```

### Test Coverage Requirements
- Minimum 80% coverage
- All new features must have tests
- Integration tests for API endpoints

## 📦 Building for Production

```bash
# Build frontend
npm run build

# Build output: dist/

# Start production server
npm start

# Or use PM2 for process management
pm2 start backend/nodejs/server.js --name ndax-engine
```

## 🌐 Deployment

### Environment Variables
```bash
PORT=3000
VITE_API_URL=https://your-api.com
NODE_ENV=production
```

### Docker (Optional)
```bash
# Build image
docker build -t ndax-engine .

# Run container
docker run -p 3000:3000 -p 5173:5173 ndax-engine
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- Issues: https://github.com/oconnorw225-del/ndax-quantum-engine/issues
- Documentation: `/docs` directory
- Email: support@ndax-engine.com (if configured)

## 🎉 Acknowledgments

Built with React, Node.js, Express, and modern web technologies.
Quantum algorithms inspired by quantum computing principles.
AI features powered by natural language processing.

---

**Version:** 1.0.0  
**Last Updated:** 2025-11-06  
**Status:** Production Ready ✅
