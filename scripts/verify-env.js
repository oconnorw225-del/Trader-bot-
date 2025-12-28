/**
 * Environment Variables Verification Script
 * Validates that all required environment variables are set
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

// Required environment variables
const requiredVars = [
  {
    name: 'DEMO_MODE',
    description: 'Application mode (true for demo, false for live trading)',
    required: true,
    validator: (value) => ['true', 'false'].includes(value.toLowerCase())
  },
  {
    name: 'ENCRYPTION_KEY',
    description: 'Encryption key for sensitive data (32+ characters)',
    required: true,
    validator: (value) => value && value.length >= 32
  },
  {
    name: 'JWT_SECRET',
    description: 'JWT secret for authentication (32+ characters)',
    required: true,
    validator: (value) => value && value.length >= 32
  },
  {
    name: 'FLASK_SECRET_KEY',
    description: 'Flask secret key (32+ characters)',
    required: true,
    validator: (value) => value && value.length >= 32
  }
];

// Optional but recommended variables
const recommendedVars = [
  { name: 'NODE_ENV', description: 'Node.js environment (development/production)' },
  { name: 'FLASK_ENV', description: 'Flask environment (development/production)' },
  { name: 'PORT', description: 'Node.js backend port (default: 3000)' },
  { name: 'FLASK_PORT', description: 'Python backend port (default: 5000)' },
  { name: 'VITE_API_URL', description: 'Frontend API URL (default: http://localhost:3000)' }
];

// Trading-specific variables (required for live trading)
const tradingVars = [
  { name: 'NDAX_API_KEY', description: 'NDAX API key' },
  { name: 'NDAX_API_SECRET', description: 'NDAX API secret' },
  { name: 'NDAX_USER_ID', description: 'NDAX user ID' }
];

// AI service variables (optional)
const aiVars = [
  { name: 'OPENAI_API_KEY', description: 'OpenAI API key' },
  { name: 'HUGGINGFACE_API_KEY', description: 'Hugging Face API key' }
];

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  
  if (!fs.existsSync(envPath)) {
    return null;
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').trim();
      if (key && value) {
        env[key] = value;
      }
    }
  });
  
  return env;
}

function checkVariable(varConfig, env) {
  const value = env[varConfig.name];
  const exists = value !== undefined && value !== '';
  
  let status = 'missing';
  let message = '';
  
  if (exists) {
    if (varConfig.validator) {
      const valid = varConfig.validator(value);
      status = valid ? 'valid' : 'invalid';
      message = valid ? '' : 'Invalid value';
    } else {
      status = 'valid';
    }
  }
  
  return { status, message, value: exists ? value : undefined };
}

function printHeader(title) {
  console.log(`\n${colors.cyan}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}\n`);
}

function printVariable(name, description, check) {
  const { status, message, value } = check;
  
  let statusSymbol, statusColor;
  
  if (status === 'valid') {
    statusSymbol = '✓';
    statusColor = colors.green;
  } else if (status === 'invalid') {
    statusSymbol = '✗';
    statusColor = colors.red;
  } else {
    statusSymbol = '○';
    statusColor = colors.yellow;
  }
  
  console.log(`${statusColor}${statusSymbol}${colors.reset} ${colors.blue}${name}${colors.reset}`);
  console.log(`  ${description}`);
  
  if (status === 'valid' && value) {
    const maskedValue = name.includes('SECRET') || name.includes('KEY') || name.includes('PASSWORD')
      ? '*'.repeat(Math.min(value.length, 20))
      : value;
    console.log(`  ${colors.cyan}Value: ${maskedValue}${colors.reset}`);
  } else if (message) {
    console.log(`  ${colors.red}${message}${colors.reset}`);
  }
  
  console.log('');
}

function generateSecureKey() {
  const crypto = await import('crypto');
  return crypto.randomBytes(32).toString('base64');
}

async function main() {
  console.clear();
  console.log(`${colors.blue}
╔══════════════════════════════════════════════════╗
║   NDAX Quantum Engine                            ║
║   Environment Verification                       ║
╚══════════════════════════════════════════════════╝
${colors.reset}`);
  
  // Check if .env exists
  const env = loadEnvFile();
  
  if (!env) {
    console.log(`${colors.red}✗ .env file not found!${colors.reset}\n`);
    console.log('Please create a .env file:');
    console.log(`  ${colors.cyan}cp .env.example .env${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ .env file found${colors.reset}\n`);
  
  // Check required variables
  printHeader('Required Variables');
  
  let allRequiredValid = true;
  
  for (const varConfig of requiredVars) {
    const check = checkVariable(varConfig, env);
    printVariable(varConfig.name, varConfig.description, check);
    
    if (check.status !== 'valid') {
      allRequiredValid = false;
    }
  }
  
  // Check recommended variables
  printHeader('Recommended Variables');
  
  for (const varConfig of recommendedVars) {
    const check = checkVariable(varConfig, env);
    printVariable(varConfig.name, varConfig.description, check);
  }
  
  // Check demo mode
  const demoMode = env.DEMO_MODE?.toLowerCase() === 'true';
  
  if (!demoMode) {
    printHeader('Trading Variables (Required for Live Trading)');
    
    for (const varConfig of tradingVars) {
      const check = checkVariable(varConfig, env);
      printVariable(varConfig.name, varConfig.description, check);
      
      if (check.status !== 'valid') {
        allRequiredValid = false;
      }
    }
  }
  
  // Check AI variables
  printHeader('AI Service Variables (Optional)');
  
  for (const varConfig of aiVars) {
    const check = checkVariable(varConfig, env);
    printVariable(varConfig.name, varConfig.description, check);
  }
  
  // Summary
  printHeader('Summary');
  
  if (allRequiredValid) {
    console.log(`${colors.green}✓ All required variables are configured correctly!${colors.reset}\n`);
    
    if (demoMode) {
      console.log(`${colors.yellow}⚠ Running in DEMO mode${colors.reset}`);
      console.log('  Live trading is disabled\n');
    } else {
      console.log(`${colors.cyan}→ Running in LIVE mode${colors.reset}`);
      console.log('  Live trading is enabled\n');
    }
    
    console.log('You can now start the application:');
    console.log(`  ${colors.cyan}npm run dev${colors.reset} - Start development server`);
    console.log(`  ${colors.cyan}npm run dev:full${colors.reset} - Start frontend + backend\n`);
    
    process.exit(0);
  } else {
    console.log(`${colors.red}✗ Some required variables are missing or invalid${colors.reset}\n`);
    console.log('Please update your .env file with the required values.\n');
    
    console.log('To generate secure keys:');
    console.log(`  ${colors.cyan}openssl rand -base64 32${colors.reset}\n`);
    
    process.exit(1);
  }
}

main().catch(error => {
  console.error(`${colors.red}Error:${colors.reset}`, error.message);
  process.exit(1);
});
