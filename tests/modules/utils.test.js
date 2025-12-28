/**
 * Tests for utility modules
 */

// Set encryption key before importing modules
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters-long';

import { encrypt, decrypt, hash, verifyHash } from '../../src/shared/encryption.js';
import analytics from '../../src/shared/analytics.js';
import { checkTradeCompliance, checkFreelanceCompliance } from '../../src/shared/compliance.js';
import recovery from '../../src/shared/crashRecovery.js';

describe('Encryption', () => {
  test('should encrypt and decrypt data', () => {
    const data = 'sensitive information';
    const encrypted = encrypt(data);
    const decrypted = decrypt(encrypted);
    
    expect(decrypted).toBe(data);
  });

  test('should throw error for empty data', () => {
    expect(() => encrypt('')).toThrow('Data is required for encryption');
    expect(() => decrypt('')).toThrow('Encrypted data is required for decryption');
  });

  test('should hash data', () => {
    const data = 'test data';
    const hashed = hash(data);
    
    expect(hashed).toBeTruthy();
    expect(hashed).toHaveLength(64);
  });

  test('should verify hash', () => {
    const data = 'test data';
    const hashed = hash(data);
    
    expect(verifyHash(data, hashed)).toBe(true);
    expect(verifyHash('wrong data', hashed)).toBe(false);
  });
});

describe('Analytics', () => {
  beforeEach(() => {
    analytics.clear();
  });

  test('should track events', () => {
    const event = analytics.trackEvent('test_event', { key: 'value' });
    
    expect(event).toHaveProperty('name', 'test_event');
    expect(event).toHaveProperty('timestamp');
  });

  test('should record metrics', () => {
    analytics.recordMetric('test_metric', 100);
    const stats = analytics.getMetricStats('test_metric');
    
    expect(stats.count).toBe(1);
    expect(stats.avg).toBe(100);
  });

  test('should get events by name', () => {
    analytics.trackEvent('event1', {});
    analytics.trackEvent('event2', {});
    analytics.trackEvent('event1', {});
    
    const events = analytics.getEventsByName('event1');
    expect(events).toHaveLength(2);
  });
});

describe('Compliance', () => {
  test('should check trade compliance', () => {
    const trade = {
      size: 5000,
      asset: 'BTC',
      kycVerified: true
    };
    
    const result = checkTradeCompliance(trade, 'US');
    
    expect(result).toHaveProperty('compliant');
    expect(result.compliant).toBe(true);
  });

  test('should fail compliance for oversized trade', () => {
    const trade = {
      size: 200000,
      asset: 'BTC',
      kycVerified: true
    };
    
    const result = checkTradeCompliance(trade, 'US');
    
    expect(result.compliant).toBe(false);
    expect(result.issues.length).toBeGreaterThan(0);
  });

  test('should check freelance compliance', () => {
    const work = {
      contract: true,
      payment: 1000,
      platform: 'Upwork'
    };
    
    const result = checkFreelanceCompliance(work);
    
    expect(result.compliant).toBe(true);
  });
});

describe('Recovery', () => {
  beforeEach(() => {
    recovery.clearSnapshots();
  });

  test('should create snapshot', () => {
    const state = { balance: 1000, positions: [] };
    const snapshot = recovery.createSnapshot(state);
    
    expect(snapshot).toHaveProperty('id');
    expect(snapshot).toHaveProperty('timestamp');
  });

  test('should restore snapshot', () => {
    const state = { balance: 1000 };
    const snapshot = recovery.createSnapshot(state);
    const restored = recovery.restoreSnapshot(snapshot.id);
    
    expect(restored.balance).toBe(1000);
  });

  test('should get latest snapshot', () => {
    recovery.createSnapshot({ balance: 1000 });
    recovery.createSnapshot({ balance: 2000 });
    
    const latest = recovery.getLatestSnapshot();
    expect(latest.state.balance).toBe(2000);
  });

  test('should handle crash', () => {
    const error = new Error('Test error');
    const state = { balance: 1000 };
    const result = recovery.handleCrash(error, state);
    
    expect(result).toHaveProperty('crashReport');
    expect(result).toHaveProperty('emergencySnapshot');
    expect(result.recovered).toBe(true);
  });
});
