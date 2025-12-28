/**
 * AI Model Manager for loading and managing multiple AI models
 */

class ModelManager {
  constructor() {
    this.models = new Map();
    this.activeModel = null;
  }

  /**
   * Load a model
   * @param {string} modelName - Name of the model
   * @param {object} config - Model configuration
   * @returns {object} Model info
   */
  loadModel(modelName, config = {}) {
    if (!modelName) {
      throw new Error('Model name is required');
    }

    const model = {
      name: modelName,
      type: config.type || 'general',
      version: config.version || '1.0.0',
      status: 'loaded',
      capabilities: config.capabilities || [],
      loadedAt: new Date().toISOString(),
      parameters: config.parameters || {}
    };

    this.models.set(modelName, model);
    
    if (!this.activeModel) {
      this.activeModel = modelName;
    }

    return model;
  }

  /**
   * Unload a model
   * @param {string} modelName - Name of the model to unload
   * @returns {boolean} Success status
   */
  unloadModel(modelName) {
    if (!this.models.has(modelName)) {
      throw new Error(`Model ${modelName} not found`);
    }

    this.models.delete(modelName);
    
    if (this.activeModel === modelName) {
      this.activeModel = this.models.size > 0 ? Array.from(this.models.keys())[0] : null;
    }

    return true;
  }

  /**
   * Switch active model
   * @param {string} modelName - Name of the model to activate
   * @returns {object} Activated model
   */
  switchModel(modelName) {
    if (!this.models.has(modelName)) {
      throw new Error(`Model ${modelName} not found`);
    }

    this.activeModel = modelName;
    return this.models.get(modelName);
  }

  /**
   * Get active model
   * @returns {object} Active model
   */
  getActiveModel() {
    if (!this.activeModel) {
      return null;
    }
    return this.models.get(this.activeModel);
  }

  /**
   * Get all loaded models
   * @returns {array} List of models
   */
  getAllModels() {
    return Array.from(this.models.values());
  }

  /**
   * Get model by name
   * @param {string} modelName - Model name
   * @returns {object} Model info
   */
  getModel(modelName) {
    return this.models.get(modelName) || null;
  }

  /**
   * Update model configuration
   * @param {string} modelName - Model name
   * @param {object} updates - Configuration updates
   * @returns {object} Updated model
   */
  updateModelConfig(modelName, updates) {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    Object.assign(model, updates);
    model.updatedAt = new Date().toISOString();
    return model;
  }

  /**
   * Check if model supports a capability
   * @param {string} modelName - Model name
   * @param {string} capability - Capability to check
   * @returns {boolean} True if capability is supported
   */
  hasCapability(modelName, capability) {
    const model = this.models.get(modelName);
    if (!model) {
      return false;
    }
    return model.capabilities.includes(capability);
  }

  /**
   * Get models by type
   * @param {string} type - Model type
   * @returns {array} Matching models
   */
  getModelsByType(type) {
    return Array.from(this.models.values()).filter(model => model.type === type);
  }

  /**
   * Get model statistics
   * @returns {object} Statistics
   */
  getStatistics() {
    return {
      totalModels: this.models.size,
      activeModel: this.activeModel,
      modelTypes: [...new Set(Array.from(this.models.values()).map(model => model.type))]
    };
  }
}

export default new ModelManager();
