/**
 * Tests for AI modules
 */

import orchestrator from '../../src/freelance/ai/orchestrator.js';
import modelManager from '../../src/freelance/ai/modelManager.js';
import plagiarismChecker from '../../src/freelance/ai/plagiarismCheck.js';
import learning from '../../src/freelance/ai/feedbackLearning.js';

describe('AI Orchestrator', () => {
  beforeEach(() => {
    orchestrator.models.clear();
    orchestrator.tasks = [];
    orchestrator.activeJobs.clear();
  });

  test('should register a model', () => {
    orchestrator.registerModel('test-model', { type: 'nlp' });
    const models = orchestrator.getModels();
    
    expect(models).toHaveLength(1);
    expect(models[0].id).toBe('test-model');
  });

  test('should execute text generation task', async () => {
    const result = await orchestrator.executeTask('text_generation', { prompt: 'Hello' });
    
    expect(result).toContain('Hello');
  });

  test('should throw error for unknown task type', async () => {
    await expect(orchestrator.executeTask('unknown_task', {})).rejects.toThrow();
  });
});

describe('Model Manager', () => {
  beforeEach(() => {
    modelManager.models.clear();
    modelManager.activeModel = null;
  });

  test('should load a model', () => {
    const model = modelManager.loadModel('test-model', { type: 'general' });
    
    expect(model.name).toBe('test-model');
    expect(model.status).toBe('loaded');
  });

  test('should switch active model', () => {
    modelManager.loadModel('model1', {});
    modelManager.loadModel('model2', {});
    modelManager.switchModel('model2');
    
    const active = modelManager.getActiveModel();
    expect(active.name).toBe('model2');
  });

  test('should throw error when switching to non-existent model', () => {
    expect(() => modelManager.switchModel('non-existent')).toThrow();
  });
});

describe('Plagiarism Checker', () => {
  beforeEach(() => {
    plagiarismChecker.checks = [];
  });

  test('should check content for plagiarism', async () => {
    const result = await plagiarismChecker.checkPlagiarism('This is test content');
    
    expect(result).toHaveProperty('plagiarismScore');
    expect(result).toHaveProperty('isOriginal');
    expect(result.plagiarismScore).toBeGreaterThanOrEqual(0);
    expect(result.plagiarismScore).toBeLessThanOrEqual(100);
  });

  test('should throw error for empty content', async () => {
    await expect(plagiarismChecker.checkPlagiarism('')).rejects.toThrow();
  });

  test('should perform batch check', async () => {
    const contents = ['Content 1', 'Content 2'];
    const results = await plagiarismChecker.batchCheck(contents);
    
    expect(results).toHaveLength(2);
  });
});

describe('Learning Module', () => {
  beforeEach(() => {
    learning.trainingData = [];
    learning.metrics.clear();
  });

  test('should add training data', () => {
    learning.addTrainingData({ input: [1, 2, 3] }, 'output');
    const stats = learning.getDataStatistics();
    
    expect(stats.totalSamples).toBe(1);
  });

  test('should train model', async () => {
    learning.addTrainingData({ input: [1, 2] }, 'label1');
    learning.addTrainingData({ input: [3, 4] }, 'label2');
    
    const result = await learning.train('test-model');
    
    expect(result).toHaveProperty('finalLoss');
    expect(result.losses).toHaveLength(10);
  });

  test('should throw error when training without data', async () => {
    await expect(learning.train('test-model')).rejects.toThrow();
  });

  test('should evaluate model', () => {
    const testData = [{ input: [1, 2] }, { input: [3, 4] }];
    const metrics = learning.evaluate('test-model', testData);
    
    expect(metrics).toHaveProperty('accuracy');
    expect(metrics).toHaveProperty('precision');
    expect(metrics).toHaveProperty('recall');
  });
});
