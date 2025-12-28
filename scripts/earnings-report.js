#!/usr/bin/env node

/**
 * Earnings Report CLI Tool
 * Displays comprehensive earnings information from the NDAX Quantum Engine
 * 
 * Usage:
 *   npm run earnings
 *   node scripts/earnings-report.js
 *   node scripts/earnings-report.js --json
 */

import axios from 'axios';

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

const API_URL = process.env.API_URL || 'http://localhost:3000';
const JSON_ONLY = process.argv.includes('--json');

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
  if (JSON_ONLY) return;
  console.log('');
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${'='.repeat(70)}${colors.reset}`);
}

/**
 * Print key-value pair
 */
function printKV(key, value, indent = 0) {
  if (JSON_ONLY) return;
  const spaces = ' '.repeat(indent * 2);
  console.log(`${spaces}${colors.bright}${key}:${colors.reset} ${value}`);
}

/**
 * Fetch earnings data from API
 */
async function fetchEarningsData() {
  try {
    const response = await axios.get(`${API_URL}/api/earnings/report`, {
      timeout: 5000
    });
    return response.data;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Backend server is not running. Please start it with: npm start');
    }
    throw new Error(`Failed to fetch earnings data: ${error.message}`);
  }
}

/**
 * Display earnings report
 */
async function displayReport() {
  try {
    printHeader('NDAX Quantum Engine - Earnings Report');

    const data = await fetchEarningsData();

    if (JSON_ONLY) {
      console.log(JSON.stringify(data, null, 2));
      return;
    }

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
        if (data.paymentInfo.cryptoPayouts.address) {
          printKV('Payout Address', data.paymentInfo.cryptoPayouts.address, 1);
        }
      }
    }

    // Footer
    console.log('');
    console.log(`${colors.cyan}Report generated at: ${data.lastUpdated}${colors.reset}`);
    console.log(`${colors.cyan}API URL: ${API_URL}${colors.reset}`);
    console.log('');

  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run the report
displayReport();
