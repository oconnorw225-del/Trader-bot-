#!/usr/bin/env node

/**
 * Demo Earnings Report - Standalone Version
 * Demonstrates the earnings tracking system with sample data
 * This version doesn't require a running server
 * 
 * Usage:
 *   node scripts/demo-earnings.js
 */

import { EarningsTracker } from '../src/services/EarningsTracker.js';

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  red: '\x1b[31m'
};

/**
 * Format currency amount
 */
function formatCurrency(amount) {
  const formatted = Math.abs(amount).toFixed(2);
  const sign = amount >= 0 ? '+' : '-';
  const color = amount >= 0 ? colors.green : colors.red;
  return `${color}${sign}$${formatted}${colors.reset}`;
}

/**
 * Print section header
 */
function printHeader(title) {
  console.log('');
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
}

/**
 * Print key-value pair
 */
function printKV(key, value, indent = 0) {
  const spaces = ' '.repeat(indent * 2);
  console.log(`${spaces}${colors.bright}${key}:${colors.reset} ${value}`);
}

/**
 * Generate sample trading data
 */
function generateSampleTrades(tracker) {
  console.log(`${colors.yellow}Generating sample trading data...${colors.reset}`);
  
  const trades = [
    { symbol: 'BTC/USD', side: 'BUY', profit: 1250.00, entryPrice: 45000, exitPrice: 46000, quantity: 0.5 },
    { symbol: 'ETH/USD', side: 'BUY', profit: 850.50, entryPrice: 2900, exitPrice: 3100, quantity: 2.5 },
    { symbol: 'BTC/USD', side: 'SELL', profit: -150.25, entryPrice: 46500, exitPrice: 46000, quantity: 0.25 },
    { symbol: 'SOL/USD', side: 'BUY', profit: 420.00, entryPrice: 180, exitPrice: 195, quantity: 10 },
    { symbol: 'ETH/USD', side: 'SELL', profit: 680.75, entryPrice: 3100, exitPrice: 3300, quantity: 2.0 },
    { symbol: 'BTC/USD', side: 'BUY', profit: 2100.00, entryPrice: 44000, exitPrice: 46000, quantity: 1.0 },
    { symbol: 'AVAX/USD', side: 'BUY', profit: 95.50, entryPrice: 35, exitPrice: 38, quantity: 15 },
  ];

  trades.forEach(trade => {
    tracker.recordTrade(trade);
  });

  console.log(`${colors.green}✓ Recorded ${trades.length} trades${colors.reset}`);
}

/**
 * Generate sample freelance data
 */
function generateSampleFreelance(tracker) {
  console.log(`${colors.yellow}Generating sample freelance data...${colors.reset}`);
  
  const jobs = [
    { platform: 'upwork', title: 'Full-Stack Web Development', earnings: 2500.00, difficulty: 'hard' },
    { platform: 'fiverr', title: 'Logo Design', earnings: 150.00, difficulty: 'easy' },
    { platform: 'freelancer', title: 'API Integration', earnings: 800.00, difficulty: 'medium' },
    { platform: 'toptal', title: 'React Native Mobile App', earnings: 5000.00, difficulty: 'hard' },
    { platform: 'upwork', title: 'Database Optimization', earnings: 1200.00, difficulty: 'medium' },
    { platform: 'fiverr', title: 'WordPress Plugin', earnings: 300.00, difficulty: 'easy' },
  ];

  jobs.forEach(job => {
    tracker.recordFreelanceEarning(job);
  });

  console.log(`${colors.green}✓ Recorded ${jobs.length} freelance jobs${colors.reset}`);
}

/**
 * Display earnings report
 */
async function displayReport() {
  try {
    printHeader('NDAX Quantum Engine - Earnings Report Demo');
    
    const tracker = new EarningsTracker();
    await tracker.initialize();

    // Generate sample data
    generateSampleTrades(tracker);
    generateSampleFreelance(tracker);

    console.log('');
    console.log(`${colors.yellow}Generating detailed earnings report...${colors.reset}`);

    const data = await tracker.getDetailedReport();

    // Total Earnings Summary
    printHeader('💰 Total Earnings Summary');
    const total = data.summary.totalEarnings || 0;
    printKV('Total Earnings', formatCurrency(total));
    console.log('');
    printKV('Breakdown', '');
    printKV('Trading Profit', formatCurrency(data.summary.breakdown.trading || 0), 1);
    printKV('Freelance Earnings', formatCurrency(data.summary.breakdown.freelance || 0), 1);
    printKV('Bot State Earnings', formatCurrency(data.summary.breakdown.botState || 0), 1);
    printKV('Payment Balance', formatCurrency(data.summary.breakdown.payments || 0), 1);

    // Period Analysis
    printHeader('📊 Earnings by Period');
    printKV('Daily', formatCurrency(data.periods.daily.total));
    printKV('  Trading', formatCurrency(data.periods.daily.trading), 1);
    printKV('  Freelance', formatCurrency(data.periods.daily.freelance), 1);
    console.log('');
    printKV('Weekly', formatCurrency(data.periods.weekly.total));
    printKV('  Trading', formatCurrency(data.periods.weekly.trading), 1);
    printKV('  Freelance', formatCurrency(data.periods.weekly.freelance), 1);
    console.log('');
    printKV('Monthly', formatCurrency(data.periods.monthly.total));
    printKV('  Trading', formatCurrency(data.periods.monthly.trading), 1);
    printKV('  Freelance', formatCurrency(data.periods.monthly.freelance), 1);

    // Source Breakdown
    if (data.sources && Object.keys(data.sources).length > 0) {
      printHeader('🔍 Earnings by Source');
      Object.entries(data.sources).forEach(([source, info]) => {
        printKV(source, `${formatCurrency(info.total)} (${info.count} transactions)`);
      });
    }

    // Statistics
    printHeader('📈 Statistics');
    printKV('Total Transactions', data.statistics.totalTransactions);
    printKV('Trading Transactions', data.statistics.tradingTransactions);
    printKV('Freelance Jobs Completed', data.statistics.freelanceJobs);
    printKV('Average per Transaction', formatCurrency(data.statistics.averageEarningPerTransaction || 0));

    // Recent Earnings
    printHeader('📝 Recent Earnings (Last 5)');
    const recent = tracker.getRecentEarnings(5);
    recent.forEach((record, index) => {
      const icon = record.type === 'trading' ? '📈' : '💼';
      console.log(`${index + 1}. ${icon} ${record.description}: ${formatCurrency(record.amount)}`);
      console.log(`   ${colors.cyan}${record.source} - ${new Date(record.timestamp).toLocaleString()}${colors.reset}`);
    });

    // Payment Information
    if (data.paymentInfo) {
      printHeader('💳 Payment Information');
      printKV('Total Transactions', data.paymentInfo.total);
      printKV('Completed Payments', data.paymentInfo.completed);
      printKV('Pending Payments', data.paymentInfo.pending);
      printKV('Current Balance', formatCurrency(data.paymentInfo.balance || 0));
      printKV('Daily Payment Volume', formatCurrency(data.paymentInfo.dailyVolume || 0));

      if (data.paymentInfo.cryptoPayouts) {
        console.log('');
        printKV('Crypto Payouts', '');
        printKV('Total', data.paymentInfo.cryptoPayouts.total, 1);
        printKV('Completed', data.paymentInfo.cryptoPayouts.completed, 1);
        printKV('Pending', data.paymentInfo.cryptoPayouts.pending, 1);
      }
    }

    // Footer
    console.log('');
    console.log(`${colors.cyan}${'─'.repeat(70)}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}Report generated at: ${data.lastUpdated}${colors.reset}`);
    console.log(`${colors.cyan}This is a demonstration with sample data${colors.reset}`);
    console.log(`${colors.cyan}For live data, use: npm run earnings${colors.reset}`);
    console.log('');

    // Summary box
    printHeader('🎯 Quick Summary');
    console.log(`${colors.bright}Total Money Made: ${formatCurrency(total)}${colors.reset}`);
    console.log(`  └─ From ${data.statistics.totalTransactions} transactions across ${Object.keys(data.sources).length} sources`);
    console.log('');

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the demo
displayReport();
