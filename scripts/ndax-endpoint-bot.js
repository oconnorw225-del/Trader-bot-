#!/usr/bin/env node

/**
 * NDAX API Endpoint Testing Bot
 * Usage: node scripts/ndax-endpoint-bot.js
 * 
 * Environment Variables Required:
 * - API_KEY or NDAX_API_KEY: Your NDAX API key
 * - API_SECRET or NDAX_API_SECRET: Your NDAX API secret
 * - BASE_URL or NDAX_BASE_URL: NDAX API base URL
 */

import { NdaxEndpointTester } from '../src/services/NdaxEndpointTester.js';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

/**
 * Main bot execution
 */
async function main() {
  // Check for --json-only flag
  const jsonOnly = process.argv.includes('--json-only');

  if (!jsonOnly) {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║        NDAX API Endpoint Testing Bot                      ║');
    console.log('║        Version 1.0.0                                       ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }

  // Get configuration from environment variables (prioritize generic names)
  const baseUrl = process.env.BASE_URL || process.env.NDAX_BASE_URL || '';
  const apiKey = process.env.API_KEY || process.env.NDAX_API_KEY || '';
  const apiSecret = process.env.API_SECRET || process.env.NDAX_API_SECRET || '';

  if (!jsonOnly) {
    console.log('Configuration:');
    console.log(`  Base URL: ${baseUrl || 'Not set'}`);
    console.log(`  API Key: ${apiKey ? '***' + apiKey.slice(-4) : 'Not set'}`);
    console.log(`  API Secret: ${apiSecret ? '***' + apiSecret.slice(-4) : 'Not set'}`);
    console.log('');

    if (!apiKey || !apiSecret || !baseUrl) {
      console.warn('⚠️  Warning: Environment variables not fully configured.');
      console.warn('   LiveMode will be set to "No" and Status to "Unknown"');
      console.warn('   Set API_KEY, API_SECRET, and BASE_URL in your environment or .env file\n');
    }

    console.log('Starting endpoint tests...\n');
  }

  const startTime = Date.now();

  try {
    // Create tester instance
    const tester = new NdaxEndpointTester({
      baseUrl,
      apiKey,
      apiSecret
    });

    // Run all tests
    const results = await tester.runAllTests();
    const duration = Date.now() - startTime;

    if (jsonOnly) {
      // Output JSON only, no commentary
      console.log(tester.getResultsJSON());
    } else {
      // Print results with formatting
      tester.printResults();

      // Generate summary
      const successful = results.filter(r => r.Status === 'Success').length;
      const failed = results.filter(r => r.Status === 'Failed').length;
      const criticalMisses = results.filter(r => r.CriticalMissesDetected === 'Yes').length;

      console.log('\n╔════════════════════════════════════════════════════════════╗');
      console.log('║                     Execution Summary                      ║');
      console.log('╠════════════════════════════════════════════════════════════╣');
      console.log(`║  Total Endpoints Tested:   ${results.length.toString().padEnd(31)}║`);
      console.log(`║  Successful:               ${successful.toString().padEnd(31)}║`);
      console.log(`║  Failed:                   ${failed.toString().padEnd(31)}║`);
      console.log(`║  Critical Misses:          ${criticalMisses.toString().padEnd(31)}║`);
      console.log(`║  Total API Calls:          ${tester.apiCount.toString().padEnd(31)}║`);
      console.log(`║  Duration:                 ${duration.toString().padEnd(27)}ms  ║`);
      console.log('╚════════════════════════════════════════════════════════════╝\n');
    }

    // Save results to file
    const resultsDir = path.join(__dirname, '../results');
    try {
      await fs.mkdir(resultsDir, { recursive: true });
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const resultsFile = path.join(resultsDir, `ndax-endpoint-results-${timestamp}.json`);
      await fs.writeFile(resultsFile, tester.getResultsJSON(), 'utf8');
      if (!jsonOnly) {
        console.log(`✓ Results saved to: ${resultsFile}\n`);
      }
    } catch (error) {
      if (!jsonOnly) {
        console.warn(`⚠️  Could not save results to file: ${error.message}\n`);
      }
    }

    // Exit with appropriate code
    const failed = results.filter(r => r.Status === 'Failed').length;
    const criticalMisses = results.filter(r => r.CriticalMissesDetected === 'Yes').length;

    if (!jsonOnly) {
      if (failed > 0) {
        console.error('❌ Some tests failed. Please check the results above.');
        process.exit(1);
      } else if (criticalMisses > 0) {
        console.warn('⚠️  Tests completed but with critical misses detected.');
        process.exit(0); // Don't fail the build for warnings
      } else {
        console.log('✅ All tests passed successfully!');
        process.exit(0);
      }
    } else {
      // For JSON-only mode, always exit successfully
      process.exit(0);
    }
  } catch (error) {
    if (jsonOnly) {
      // Output error as JSON
      console.log(JSON.stringify({
        error: error.message,
        stack: error.stack
      }, null, 2));
    } else {
      console.error('\n❌ Fatal error during test execution:');
      console.error(error);
    }
    process.exit(1);
  }
}

// Run the bot
main();
