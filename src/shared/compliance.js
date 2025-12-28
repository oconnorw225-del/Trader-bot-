/**
 * Compliance checker module for regulatory compliance
 */

import webhookManager from './webhookManager.js';

const COMPLIANCE_RULES = {
  US: {
    maxTradeSize: 100000,
    requiresKYC: true,
    allowedAssets: ['BTC', 'ETH', 'USDT', 'USDC'],
    tradingHours: { start: 0, end: 24 }
  },
  EU: {
    maxTradeSize: 50000,
    requiresKYC: true,
    allowedAssets: ['BTC', 'ETH', 'USDT', 'USDC', 'EUR'],
    tradingHours: { start: 0, end: 24 }
  },
  ASIA: {
    maxTradeSize: 75000,
    requiresKYC: true,
    allowedAssets: ['BTC', 'ETH', 'USDT', 'USDC'],
    tradingHours: { start: 0, end: 24 }
  }
};

/**
 * Check if a trade is compliant
 * @param {object} trade - Trade details
 * @param {string} region - Compliance region
 * @returns {object} Compliance check result
 */
export function checkTradeCompliance(trade, region = 'US') {
  const rules = COMPLIANCE_RULES[region];
  const issues = [];

  if (!rules) {
    return { compliant: false, issues: ['Unknown compliance region'] };
  }

  if (trade.size > rules.maxTradeSize) {
    issues.push(`Trade size exceeds maximum allowed (${rules.maxTradeSize})`);
  }

  if (!rules.allowedAssets.includes(trade.asset)) {
    issues.push(`Asset ${trade.asset} not allowed in ${region}`);
  }

  if (rules.requiresKYC && !trade.kycVerified) {
    issues.push('KYC verification required');
  }

  const result = {
    compliant: issues.length === 0,
    issues,
    region
  };

  // Trigger webhook if compliance failed
  if (!result.compliant) {
    webhookManager.triggerEvent('compliance.failed', {
      type: 'trade',
      region,
      issues,
      trade: {
        size: trade.size,
        asset: trade.asset
      },
      timestamp: new Date().toISOString()
    }).catch(err => {
      console.error('Webhook delivery failed:', err);
    });
  }

  return result;
}

/**
 * Check if freelance work is compliant
 * @param {object} work - Work details
 * @param {string} region - Compliance region
 * @returns {object} Compliance check result
 */
export function checkFreelanceCompliance(work, region = 'US') {
  const issues = [];

  if (!work.contract) {
    issues.push('Work contract required');
  }

  if (work.payment && work.payment < 0) {
    issues.push('Invalid payment amount');
  }

  if (!work.platform) {
    issues.push('Platform must be specified');
  }

  return {
    compliant: issues.length === 0,
    issues,
    region
  };
}

/**
 * Validate API key usage compliance
 * @param {string} apiKey - API key
 * @param {object} usage - Usage statistics
 * @returns {object} Compliance check result
 */
export function checkAPICompliance(apiKey, usage) {
  const issues = [];
  const MAX_DAILY_REQUESTS = 10000;
  const MAX_RATE_PER_MINUTE = 100;

  if (usage.dailyRequests > MAX_DAILY_REQUESTS) {
    issues.push('Daily request limit exceeded');
  }

  if (usage.requestsPerMinute > MAX_RATE_PER_MINUTE) {
    issues.push('Rate limit exceeded');
  }

  return {
    compliant: issues.length === 0,
    issues
  };
}

/**
 * Generate compliance report
 * @param {array} checks - Array of compliance checks
 * @returns {object} Compliance report
 */
export function generateComplianceReport(complianceChecks) {
  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter(check => check.compliant).length;
  const allIssues = complianceChecks.flatMap(check => check.issues || []);

  return {
    totalChecks,
    passedChecks,
    failedChecks: totalChecks - passedChecks,
    complianceRate: totalChecks > 0 ? (passedChecks / totalChecks) * 100 : 0,
    issues: allIssues,
    generatedAt: new Date().toISOString()
  };
}

export default {
  checkTradeCompliance,
  checkFreelanceCompliance,
  checkAPICompliance,
  generateComplianceReport
};
