/**
 * Learning module for continuous model improvement
 */

class LearningModule {
  constructor() {
    this.trainingData = [];
    this.metrics = new Map();
    this.learningRate = 0.01;
    // Add configurable limit to prevent unbounded memory growth
    this.maxTrainingData = 10000;
  }

  /**
   * Add training data
   * @param {object} data - Training data point
   * @param {any} label - Expected output
   */
  addTrainingData(data, label) {
    if (!data) {
      throw new Error('Training data is required');
    }

    this.trainingData.push({
      id: `data_${Date.now()}`,
      data,
      label,
      addedAt: new Date().toISOString()
    });
    
    // Keep only the most recent training data to prevent memory leaks
    if (this.trainingData.length > this.maxTrainingData) {
      const excess = this.trainingData.length - this.maxTrainingData;
      this.trainingData.splice(0, excess);
    }
  }

  /**
   * Train model with accumulated data
   * @param {string} modelId - Model to train
   * @param {object} options - Training options
   * @returns {Promise<object>} Training results
   */
  async train(modelId, options = {}) {
    if (!modelId) {
      throw new Error('Model ID is required');
    }

    if (this.trainingData.length === 0) {
      throw new Error('No training data available');
    }

    const epochs = options.epochs || 10;
    const batchSize = options.batchSize || 32;

    const results = {
      modelId,
      startedAt: new Date().toISOString(),
      epochs,
      batchSize,
      totalSamples: this.trainingData.length,
      losses: []
    };

    // Simulate training epochs
    for (let epoch = 0; epoch < epochs; epoch++) {
      const loss = this.calculateLoss(epoch);
      results.losses.push(loss);
    }

    results.completedAt = new Date().toISOString();
    results.finalLoss = results.losses[results.losses.length - 1];
    
    this.recordMetric(modelId, 'training', results);
    return results;
  }

  /**
   * Calculate training loss (simulated)
   * @param {number} epoch - Current epoch
   * @returns {number} Loss value
   */
  calculateLoss(epoch) {
    // Simulate decreasing loss over epochs
    const initialLoss = 1.0;
    const decayRate = 0.9;
    return initialLoss * Math.pow(decayRate, epoch) + (Math.random() * 0.1);
  }

  /**
   * Evaluate model performance
   * @param {string} modelId - Model to evaluate
   * @param {array} testData - Test dataset
   * @returns {object} Evaluation metrics
   */
  evaluate(modelId, testData) {
    if (!testData || testData.length === 0) {
      throw new Error('Test data is required');
    }

    // Simulate evaluation
    const accuracy = 0.75 + (Math.random() * 0.2);
    const precision = 0.70 + (Math.random() * 0.25);
    const recall = 0.72 + (Math.random() * 0.23);

    const metrics = {
      modelId,
      accuracy,
      precision,
      recall,
      f1Score: (2 * precision * recall) / (precision + recall),
      testSamples: testData.length,
      evaluatedAt: new Date().toISOString()
    };

    this.recordMetric(modelId, 'evaluation', metrics);
    return metrics;
  }

  /**
   * Perform incremental learning
   * @param {string} modelId - Model ID
   * @param {array} newData - New training data
   * @returns {Promise<object>} Learning results
   */
  async incrementalLearn(modelId, newData) {
    if (!newData || newData.length === 0) {
      throw new Error('New data is required');
    }

    newData.forEach(item => {
      this.addTrainingData(item.data, item.label);
    });

    return await this.train(modelId, { epochs: 3 });
  }

  /**
   * Record performance metric
   * @param {string} modelId - Model ID
   * @param {string} metricType - Type of metric
   * @param {object} value - Metric value
   */
  recordMetric(modelId, metricType, value) {
    const key = `${modelId}_${metricType}`;
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key).push({
      value,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get metrics for a model
   * @param {string} modelId - Model ID
   * @param {string} metricType - Type of metric
   * @returns {array} Metric history
   */
  getMetrics(modelId, metricType = null) {
    if (metricType) {
      const key = `${modelId}_${metricType}`;
      return this.metrics.get(key) || [];
    }

    // Return all metrics for model
    const allMetrics = {};
    for (const [key, value] of this.metrics) {
      if (key.startsWith(modelId)) {
        const type = key.split('_').slice(1).join('_');
        allMetrics[type] = value;
      }
    }
    return allMetrics;
  }

  /**
   * Get training data statistics
   * @returns {object} Statistics
   */
  getDataStatistics() {
    return {
      totalSamples: this.trainingData.length,
      oldestSample: this.trainingData[0]?.addedAt || null,
      newestSample: this.trainingData[this.trainingData.length - 1]?.addedAt || null
    };
  }

  /**
   * Clear training data
   */
  clearTrainingData() {
    this.trainingData = [];
  }

  /**
   * Export training data
   * @returns {array} Training data
   */
  exportTrainingData() {
    return this.trainingData;
  }
}

export default new LearningModule();
