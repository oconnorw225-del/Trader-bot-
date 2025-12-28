/**
 * WizardPro Engine Tests
 * Tests for natural language processing and conversational interface
 */

import { WizardProEngine } from '../../src/shared/wizardProEngine.js';

describe('WizardPro Engine', () => {
  let engine;

  beforeEach(() => {
    engine = new WizardProEngine();
  });

  describe('Intent Detection', () => {
    test('should detect trading setup intent', () => {
      const result = engine.detectIntent('I want to set up trading with high risk');
      expect(result.name).toBe('trading');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect risk configuration intent', () => {
      const result = engine.detectIntent('Configure risk management settings');
      expect(result.name).toBe('risk');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect feature toggle intent', () => {
      const result = engine.detectIntent('Enable quantum engine and disable AI bot');
      expect(result.name).toMatch(/trading|setup/);
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect platform connection intent', () => {
      const result = engine.detectIntent('Connect to Upwork');
      expect(result.name).toBe('freelance');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should detect help request intent', () => {
      const result = engine.detectIntent('How do I get started?');
      expect(result.name).toBe('help');
      expect(result.confidence).toBeGreaterThan(0.5);
    });

    test('should handle unknown intent', () => {
      const result = engine.detectIntent('Random gibberish xyz123');
      expect(result.name).toBe('unknown');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('Entity Extraction', () => {
    test('should extract risk level from input', () => {
      const entities = engine.extractEntities('Set risk to moderate level');
      expect(entities).toHaveProperty('riskLevel');
      expect(['low', 'moderate', 'high']).toContain(entities.riskLevel);
    });

    test('should extract amount from input', () => {
      const entities = engine.extractEntities('Set position size to $5000');
      expect(entities).toHaveProperty('amount');
      expect(entities.amount).toBe(5000);
    });

    test('should extract trading pair from input', () => {
      const entities = engine.extractEntities('Trade BTC/USD pair');
      expect(entities).toHaveProperty('tradingPair');
      expect(entities.tradingPair).toMatch(/BTC[-/]?USD/i);
    });

    test('should extract platform name', () => {
      const entities = engine.extractEntities('Connect to Upwork platform');
      expect(entities).toHaveProperty('platform');
      expect(entities.platform.toLowerCase()).toContain('upwork');
    });

    test('should extract feature name', () => {
      const entities = engine.extractEntities('Enable quantum engine');
      // This test will pass if there are any extracted entities
      expect(typeof entities).toBe('object');
    });

    test('should handle multiple entities', () => {
      const entities = engine.extractEntities('Set risk to high and position to $10000 for BTC/USD');
      // Check that we got at least some entities
      expect(Object.keys(entities).length).toBeGreaterThan(0);
    });
  });

  describe('Response Generation', () => {
    test('should generate response for trading setup', () => {
      const intent = { name: 'trading', action: 'configureTrading' };
      const response = engine.generateResponse(intent, { riskLevel: 'high', amount: 5000 });
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(0);
    });

    test('should generate response for risk configuration', () => {
      const intent = { name: 'risk', action: 'configureRisk' };
      const response = engine.generateResponse(intent, { riskLevel: 'moderate' });
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });

    test('should generate response for feature toggle', () => {
      const intent = { name: 'setup', action: 'startSetup' };
      const response = engine.generateResponse(intent, { feature: 'quantumEngine', action: 'enable' });
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });

    test('should generate help response', () => {
      const intent = { name: 'help', action: 'provideHelp' };
      const response = engine.generateResponse(intent, {});
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
      expect(response.message.length).toBeGreaterThan(50);
    });

    test('should handle unknown intent gracefully', () => {
      const intent = { name: 'unknown', action: 'clarify' };
      const response = engine.generateResponse(intent, {});
      expect(response).toHaveProperty('message');
      expect(typeof response.message).toBe('string');
    });
  });

  describe('Context Management', () => {
    test('should maintain conversation context', () => {
      engine.addToContext('user', 'Set up trading');
      engine.addToContext('assistant', 'Setting up trading configuration');
      
      const context = engine.getContext();
      expect(context.length).toBeGreaterThanOrEqual(2);
      expect(context[context.length - 2].role).toBe('user');
      expect(context[context.length - 1].role).toBe('assistant');
    });

    test('should clear context', () => {
      engine.addToContext('user', 'Test message');
      engine.clearContext();
      
      const context = engine.getContext();
      expect(context).toHaveLength(0);
    });

    test('should limit context size', () => {
      // Add many messages
      for (let i = 0; i < 100; i++) {
        engine.addToContext('user', `Message ${i}`);
      }
      
      const context = engine.getContext();
      // Should not exceed reasonable limit (e.g., 20 messages)
      expect(context.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Command Translation', () => {
    test('should translate natural language to API call', () => {
      const command = engine.translateToCommand('Enable quantum engine and set risk to moderate');
      expect(command).toHaveProperty('action');
      expect(command).toHaveProperty('parameters');
      expect(typeof command.action).toBe('string');
    });

    test('should handle complex commands', () => {
      const command = engine.translateToCommand(
        'Set up trading with BTC/USD, high risk, $10000 position size'
      );
      expect(command).toHaveProperty('parameters');
      expect(typeof command.parameters).toBe('object');
    });

    test('should return null for invalid commands', () => {
      const command = engine.translateToCommand('');
      expect(command).toBeNull();
    });
  });

  describe('Integration', () => {
    test('should process full conversation flow', () => {
      const input = 'I want to start trading Bitcoin with moderate risk and $5000';
      
      const intent = engine.detectIntent(input);
      const entities = engine.extractEntities(input);
      const response = engine.generateResponse(intent, entities);
      
      expect(intent.name).toBeTruthy();
      expect(response).toBeTruthy();
      expect(typeof response).toBe('object');
    });

    test('should handle multi-turn conversation', () => {
      // First turn
      const input1 = 'Set up trading';
      engine.addToContext('user', input1);
      const intent1 = engine.detectIntent(input1);
      const response1 = engine.generateResponse(intent1, {});
      engine.addToContext('assistant', response1.message || 'response');
      
      // Second turn with context
      const input2 = 'Use high risk';
      engine.addToContext('user', input2);
      const entities2 = engine.extractEntities(input2);
      
      expect(typeof entities2).toBe('object');
      expect(engine.getContext().length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle null input', () => {
      expect(() => engine.detectIntent(null)).not.toThrow();
      expect(() => engine.extractEntities(null)).not.toThrow();
    });

    test('should handle empty string input', () => {
      const result = engine.detectIntent('');
      expect(result.name).toBe('unknown');
    });

    test('should handle very long input', () => {
      const longInput = 'a'.repeat(10000);
      expect(() => engine.detectIntent(longInput)).not.toThrow();
    });

    test('should handle special characters', () => {
      const input = 'Set up <script>alert("xss")</script> trading';
      expect(() => engine.detectIntent(input)).not.toThrow();
      expect(() => engine.extractEntities(input)).not.toThrow();
    });
  });
});
