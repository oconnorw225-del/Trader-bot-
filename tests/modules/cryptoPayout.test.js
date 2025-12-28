/**
 * Tests for Ethereum address validation and crypto payouts
 */

import { 
  isValidEthereumAddress, 
  normalizeEthereumAddress, 
  formatEthereumAddress,
  validateEthereumAddress 
} from '../../src/shared/ethereumValidator.js';
import { PaymentManager } from '../../src/freelance/paymentManager.js';
import configManager from '../../src/shared/configManager.js';

describe('Ethereum Address Validation', () => {
  test('should validate correct Ethereum address', () => {
    const validAddress = '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5';
    expect(isValidEthereumAddress(validAddress)).toBe(true);
  });

  test('should reject invalid Ethereum addresses', () => {
    expect(isValidEthereumAddress('0x123')).toBe(false);
    expect(isValidEthereumAddress('not-an-address')).toBe(false);
    expect(isValidEthereumAddress('0xGGGG2EFd59Beb1dDc909A6f1b0Dc324bA14799a5')).toBe(false);
    expect(isValidEthereumAddress('')).toBe(false);
    expect(isValidEthereumAddress(null)).toBe(false);
    expect(isValidEthereumAddress(undefined)).toBe(false);
  });

  test('should normalize Ethereum address to lowercase', () => {
    const address = '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5';
    const normalized = normalizeEthereumAddress(address);
    expect(normalized).toBe('0xd4ea2efd59beb1ddc909a6f1b0dc324ba14799a5');
  });

  test('should throw error when normalizing invalid address', () => {
    expect(() => normalizeEthereumAddress('invalid')).toThrow('Invalid Ethereum address');
  });

  test('should format Ethereum address for display', () => {
    const address = '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5';
    const formatted = formatEthereumAddress(address);
    expect(formatted).toBe('0xd4eA...99a5');
  });

  test('should format with custom prefix/suffix length', () => {
    const address = '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5';
    const formatted = formatEthereumAddress(address, 8, 6);
    expect(formatted).toBe('0xd4eA2E...4799a5');
  });

  test('should return original address if invalid when formatting', () => {
    const invalidAddress = 'invalid';
    expect(formatEthereumAddress(invalidAddress)).toBe(invalidAddress);
  });

  test('should validate and return complete validation result', () => {
    const validAddress = '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5';
    const result = validateEthereumAddress(validAddress);
    
    expect(result.isValid).toBe(true);
    expect(result.address).toBe('0xd4ea2efd59beb1ddc909a6f1b0dc324ba14799a5');
    expect(result.formatted).toBe('0xd4eA...99a5');
    expect(result.error).toBe(null);
  });

  test('should return error for invalid address in validation result', () => {
    const invalidAddress = 'invalid';
    const result = validateEthereumAddress(invalidAddress);
    
    expect(result.isValid).toBe(false);
    expect(result.address).toBe(null);
    expect(result.formatted).toBe(null);
    expect(result.error).toBe('Invalid Ethereum address format');
  });
});

describe('Crypto Payout Integration', () => {
  let paymentManager;

  beforeEach(() => {
    // Reset payment manager for each test
    paymentManager = new PaymentManager();
    
    // Ensure crypto payouts are enabled
    configManager.set('enableCryptoPayouts', true);
    configManager.set('cryptoPayoutAddress', '0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5');
  });

  afterEach(() => {
    // Clean up any pending timeouts
    if (paymentManager && paymentManager.cryptoPayouts) {
      paymentManager.cryptoPayouts.forEach(payout => {
        if (payout.timeoutId) {
          clearTimeout(payout.timeoutId);
        }
      });
    }
  });

  test('should process crypto payout for completed job', () => {
    const jobData = {
      jobId: 'job_123',
      amount: 100,
      currency: 'USD',
      platformName: 'Upwork'
    };

    const payout = paymentManager.processCryptoPayout(jobData);

    expect(payout).toHaveProperty('id');
    expect(payout.jobId).toBe('job_123');
    expect(payout.amount).toBe(100);
    expect(payout.currency).toBe('USD');
    expect(payout.cryptoAddress).toBe('0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5');
    expect(payout.platformName).toBe('Upwork');
    expect(payout.status).toBe('pending');
    expect(payout.type).toBe('crypto_payout');
  });

  test('should throw error for invalid payout amount', () => {
    const jobData = {
      jobId: 'job_123',
      amount: 0,
      currency: 'USD'
    };

    expect(() => paymentManager.processCryptoPayout(jobData)).toThrow('Invalid payout amount');
  });

  test('should throw error when crypto payouts are disabled', () => {
    configManager.set('enableCryptoPayouts', false);
    
    const jobData = {
      jobId: 'job_123',
      amount: 100,
      currency: 'USD'
    };

    expect(() => paymentManager.processCryptoPayout(jobData)).toThrow('Crypto payouts are disabled');
  });

  test('should throw error for invalid crypto address configuration', () => {
    configManager.set('cryptoPayoutAddress', 'invalid-address');
    
    const jobData = {
      jobId: 'job_123',
      amount: 100,
      currency: 'USD'
    };

    expect(() => paymentManager.processCryptoPayout(jobData)).toThrow('Invalid crypto payout address configured');
  });

  test('should confirm crypto payout', async () => {
    const jobData = {
      jobId: 'job_123',
      amount: 100,
      currency: 'USD',
      platformName: 'Fiverr'
    };

    const payout = paymentManager.processCryptoPayout(jobData);
    
    // Wait for auto-confirmation
    await new Promise(resolve => setTimeout(resolve, 2100));
    
    const confirmedPayout = paymentManager.cryptoPayouts.find(p => p.id === payout.id);
    expect(confirmedPayout.status).toBe('completed');
    expect(confirmedPayout).toHaveProperty('completedAt');
    expect(confirmedPayout).toHaveProperty('txHash');
    expect(confirmedPayout.txHash).toMatch(/^0x[a-f0-9]+$/);
  });

  test('should get crypto payout address from config', () => {
    const address = paymentManager.getCryptoPayoutAddress();
    expect(address).toBe('0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5');
  });

  test('should get all crypto payouts', () => {
    paymentManager.processCryptoPayout({
      jobId: 'job_1',
      amount: 50,
      currency: 'USD'
    });

    paymentManager.processCryptoPayout({
      jobId: 'job_2',
      amount: 75,
      currency: 'USD'
    });

    const payouts = paymentManager.getCryptoPayouts();
    expect(payouts.length).toBe(2);
  });

  test('should filter crypto payouts by status', async () => {
    paymentManager.processCryptoPayout({
      jobId: 'job_1',
      amount: 50,
      currency: 'USD'
    });

    // Small delay to ensure unique IDs
    await new Promise(resolve => setTimeout(resolve, 10));

    paymentManager.processCryptoPayout({
      jobId: 'job_2',
      amount: 75,
      currency: 'USD'
    });

    // Wait for auto-confirmation
    await new Promise(resolve => setTimeout(resolve, 2100));

    const completedPayouts = paymentManager.getCryptoPayouts({ status: 'completed' });
    expect(completedPayouts.length).toBe(2);
    expect(completedPayouts[0].status).toBe('completed');
  });

  test('should limit crypto payouts in results', () => {
    for (let i = 1; i <= 5; i++) {
      paymentManager.processCryptoPayout({
        jobId: `job_${i}`,
        amount: i * 10,
        currency: 'USD'
      });
    }

    const limitedPayouts = paymentManager.getCryptoPayouts({ limit: 3 });
    expect(limitedPayouts.length).toBe(3);
  });

  test('should include crypto payout stats in statistics', async () => {
    paymentManager.processCryptoPayout({
      jobId: 'job_1',
      amount: 100,
      currency: 'USD'
    });

    // Small delay to ensure unique IDs
    await new Promise(resolve => setTimeout(resolve, 10));

    paymentManager.processCryptoPayout({
      jobId: 'job_2',
      amount: 200,
      currency: 'USD'
    });

    // Wait for auto-confirmation
    await new Promise(resolve => setTimeout(resolve, 2100));

    const stats = paymentManager.getStatistics();
    
    expect(stats.cryptoPayouts).toBeDefined();
    expect(stats.cryptoPayouts.total).toBe(2);
    expect(stats.cryptoPayouts.completed).toBe(2);
    expect(stats.cryptoPayouts.pending).toBe(0);
    expect(stats.cryptoPayouts.address).toBe('0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5');
  });

  test('should handle default currency for crypto payout', () => {
    const jobData = {
      jobId: 'job_123',
      amount: 100
    };

    const payout = paymentManager.processCryptoPayout(jobData);
    expect(payout.currency).toBe('USD');
  });

  test('should handle default platform name for crypto payout', () => {
    const jobData = {
      jobId: 'job_123',
      amount: 100
    };

    const payout = paymentManager.processCryptoPayout(jobData);
    expect(payout.platformName).toBe('unknown');
  });
});

describe('ConfigManager Crypto Configuration', () => {
  test('should have crypto payout address configured', () => {
    const address = configManager.get('cryptoPayoutAddress');
    expect(address).toBe('0xd4eA2EFd59Beb1dDc909A6f1b0Dc324bA14799a5');
  });

  test('should have crypto payouts enabled by default', () => {
    const enabled = configManager.get('enableCryptoPayouts');
    expect(enabled).toBe(true);
  });

  test('should validate crypto payout address in config', () => {
    const address = configManager.get('cryptoPayoutAddress');
    expect(isValidEthereumAddress(address)).toBe(true);
  });
});
