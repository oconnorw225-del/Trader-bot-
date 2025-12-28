/**
 * Wizard Pro - Natural Language Processing and Command Translation
 * Provides conversational AI interface for setup and configuration
 */

import configManager from './configManager.js';

class WizardProEngine {
  constructor() {
    this.context = {
      currentStep: 'welcome',
      userPreferences: {},
      conversationHistory: [],
      extractedData: {}
    };
    
    this.intents = this.initializeIntents();
    this.entities = this.initializeEntities();
  }

  /**
   * Initialize intent recognition patterns
   */
  initializeIntents() {
    return {
      help: {
        patterns: [
          /(?:how do|how to|what is|what are)/i,
          /(?:help|support|assist|guide)/i,
          /(?:explain|tell me|show me)/i,
          /(?:confused|don't understand|unclear)/i
        ],
        action: 'provideHelp'
      },
      risk: {
        patterns: [
          /(?:risk|safety|limit|protection)/i,
          /(?:loss|maximum|stop)/i,
          /(?:conservative|moderate|aggressive)/i
        ],
        action: 'configureRisk'
      },
      freelance: {
        patterns: [
          /(?:upwork|fiverr|freelancer|toptal)/i,
          /(?:freelance|job|gig|work)(?!\s+started)/i,
          /(?:application|apply|bid)/i
        ],
        action: 'configureFreelance'
      },
      setup: {
        patterns: [
          /(?:setup|configure|install|initialize)(?!\s+(?:risk|safety|limit))/i,
          /(?:begin|launch|create)/i,
          /(?:want to|need to|i'd like to) (?:setup|configure)/i
        ],
        action: 'startSetup'
      },
      trading: {
        patterns: [
          /(?:trading|trade|buy|sell|market)/i,
          /(?:bitcoin|btc|ethereum|eth|crypto)/i,
          /(?:quantum|strategy|algorithm)/i
        ],
        action: 'configureTrading'
      },
      api: {
        patterns: [
          /(?:api|key|secret|token|credentials)/i,
          /(?:authenticate|authorize)/i,
          /(?:ndax|exchange)/i
        ],
        action: 'configureAPI'
      },
      status: {
        patterns: [
          /(?:status|progress|where am i|current)/i,
          /(?:what's next|next step|continue)/i
        ],
        action: 'showStatus'
      },
      complete: {
        patterns: [
          /(?:done|finished|complete|ready)/i,
          /(?:launch|start|go live|deploy)/i
        ],
        action: 'completeSetup'
      }
    };
  }

  /**
   * Initialize entity extraction patterns
   */
  initializeEntities() {
    return {
      apiKey: {
        pattern: /(?:api[_\s]?key|key)[\s:=]+([a-zA-Z0-9_-]{20,})/i,
        extractor: (match) => match[1]
      },
      apiSecret: {
        pattern: /(?:api[_\s]?secret|secret)[\s:=]+([a-zA-Z0-9_-]{20,})/i,
        extractor: (match) => match[1]
      },
      amount: {
        pattern: /\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/,
        extractor: (match) => parseFloat(match[1].replace(/,/g, ''))
      },
      percentage: {
        pattern: /(\d+(?:\.\d+)?)\s*%/,
        extractor: (match) => parseFloat(match[1])
      },
      riskLevel: {
        pattern: /\b(conservative|moderate|aggressive)\b/i,
        extractor: (match) => match[1].toLowerCase()
      },
      tradingPair: {
        pattern: /\b([A-Z]{3,4})\/([A-Z]{3,4})\b/,
        extractor: (match) => match[0]
      },
      platform: {
        pattern: /\b(upwork|fiverr|freelancer|toptal|guru|peopleperhour)\b/i,
        extractor: (match) => match[1].toLowerCase()
      },
      yesNo: {
        pattern: /\b(yes|no|y|n|yeah|nope|sure|nah)\b/i,
        extractor: (match) => {
          const val = match[1].toLowerCase();
          return ['yes', 'y', 'yeah', 'sure'].includes(val);
        }
      }
    };
  }

  /**
   * Process natural language input
   * @param {string} input - User input text
   * @returns {object} Processed result with intent and entities
   */
  processInput(input) {
    const normalizedInput = input.trim();
    
    // Add to conversation history
    this.context.conversationHistory.push({
      role: 'user',
      content: normalizedInput,
      timestamp: Date.now()
    });

    // Extract entities
    const entities = this.extractEntities(normalizedInput);
    
    // Detect intent
    const intent = this.detectIntent(normalizedInput);
    
    // Generate response
    const response = this.generateResponse(intent, entities);
    
    // Add response to history
    this.context.conversationHistory.push({
      role: 'assistant',
      content: response.message,
      timestamp: Date.now()
    });

    return {
      intent: intent.name,
      entities,
      response: response.message,
      action: response.action,
      suggestions: response.suggestions,
      context: this.context
    };
  }

  /**
   * Detect user intent from input
   * @param {string} input - User input
   * @returns {object} Detected intent
   */
  detectIntent(input) {
    let bestMatch = {
      name: 'unknown',
      action: 'clarify',
      confidence: 0.3
    };
    
    // Check all intents and score them
    for (const [intentName, intentData] of Object.entries(this.intents)) {
      for (const pattern of intentData.patterns) {
        if (pattern.test(input)) {
          // Calculate confidence based on specificity
          const match = input.match(pattern);
          const matchLength = match[0].length;
          const confidence = 0.6 + (matchLength / input.length) * 0.4;
          
          // Prefer more specific matches
          if (confidence > bestMatch.confidence) {
            bestMatch = {
              name: intentName,
              action: intentData.action,
              confidence: Math.min(confidence, 0.95)
            };
          }
        }
      }
    }
    
    return bestMatch;
  }

  /**
   * Extract entities from input
   * @param {string} input - User input
   * @returns {object} Extracted entities
   */
  extractEntities(input) {
    const extracted = {};
    
    // Handle null/undefined input
    if (!input || typeof input !== 'string') {
      return extracted;
    }
    
    for (const [entityName, entityData] of Object.entries(this.entities)) {
      const match = input.match(entityData.pattern);
      if (match) {
        extracted[entityName] = entityData.extractor(match);
        
        // Update extracted data in context
        this.context.extractedData[entityName] = extracted[entityName];
      }
    }
    
    return extracted;
  }

  /**
   * Generate response based on intent and entities
   * @param {object} intent - Detected intent
   * @param {object} entities - Extracted entities
   * @returns {object} Response with message and actions
   */
  generateResponse(intent, entities) {
    const responses = {
      setup: {
        message: "I'll help you set up your NDAX Quantum Engine! I can configure trading, freelance automation, and all the settings you need. What would you like to set up first?",
        action: 'showSetupOptions',
        suggestions: ['Trading Setup', 'Freelance Setup', 'Both', 'API Configuration']
      },
      trading: {
        message: this.generateTradingResponse(entities),
        action: 'configureTradingSettings',
        suggestions: ['Set Risk Level', 'Configure API Keys', 'Choose Trading Pair']
      },
      freelance: {
        message: this.generateFreelanceResponse(entities),
        action: 'configureFreelanceSettings',
        suggestions: ['Connect Upwork', 'Connect Fiverr', 'Set Job Criteria']
      },
      api: {
        message: this.generateAPIResponse(entities),
        action: 'configureAPIKeys',
        suggestions: ['NDAX API', 'Upwork API', 'AI Model Keys']
      },
      risk: {
        message: this.generateRiskResponse(entities),
        action: 'configureRiskSettings',
        suggestions: ['Conservative', 'Moderate', 'Aggressive']
      },
      help: {
        message: "I'm here to help! You can ask me to:\n• Set up trading or freelance automation\n• Configure API keys and credentials\n• Adjust risk settings\n• Enable or disable features\n• Check your setup status\n\nWhat would you like to know more about?",
        action: 'provideGuidance',
        suggestions: ['How to start?', 'What can it do?', 'Security info']
      },
      status: {
        message: this.generateStatusResponse(),
        action: 'showProgress',
        suggestions: ['Continue Setup', 'Skip This', 'Review Settings']
      },
      complete: {
        message: "Great! Your setup is ready. I'll save your configuration and launch the dashboard. You can always come back to adjust settings later.",
        action: 'finalize',
        suggestions: ['Launch Now', 'Review First', 'Save for Later']
      },
      unknown: {
        message: "I'm not sure I understood that. Could you rephrase? You can ask me about:\n• Setting up trading or freelance\n• Configuring API keys\n• Adjusting risk settings\n• Getting help",
        action: 'requestClarification',
        suggestions: ['Start Setup', 'Get Help', 'Show Status']
      }
    };

    return responses[intent.name] || responses.unknown;
  }

  /**
   * Generate trading-specific response
   * @param {object} entities - Extracted entities
   * @returns {string} Response message
   */
  generateTradingResponse(entities) {
    let message = "Let's set up your quantum trading system! ";
    
    if (entities.tradingPair) {
      message += `I see you're interested in ${entities.tradingPair}. `;
    }
    
    if (entities.amount) {
      message += `You mentioned $${entities.amount}. I'll use that for position sizing. `;
      configManager.set('maxPositionSize', entities.amount);
    }
    
    if (entities.riskLevel) {
      message += `Setting your risk level to ${entities.riskLevel}. `;
      configManager.set('riskLevel', entities.riskLevel);
    }
    
    message += "What else would you like to configure for trading?";
    
    return message;
  }

  /**
   * Generate freelance-specific response
   * @param {object} entities - Extracted entities
   * @returns {string} Response message
   */
  generateFreelanceResponse(entities) {
    let message = "Let's set up freelance automation! ";
    
    if (entities.platform) {
      message += `Great! I'll help you connect to ${entities.platform}. `;
    }
    
    if (entities.amount) {
      message += `Minimum job budget set to $${entities.amount}. `;
      configManager.set('minJobBudget', entities.amount);
    }
    
    message += "Which platforms would you like to integrate?";
    
    return message;
  }

  /**
   * Generate API configuration response
   * @param {object} entities - Extracted entities
   * @returns {string} Response message
   */
  generateAPIResponse(entities) {
    let message = "I can help you configure your API keys. ";
    
    if (entities.apiKey) {
      message += "I received your API key. ";
    }
    
    if (entities.apiSecret) {
      message += "I received your API secret. ";
    }
    
    message += "For security, all credentials are encrypted before storage. Which APIs would you like to configure?";
    
    return message;
  }

  /**
   * Generate risk management response
   * @param {object} entities - Extracted entities
   * @returns {string} Response message
   */
  generateRiskResponse(entities) {
    let message = "Let's configure your risk management settings. ";
    
    if (entities.riskLevel) {
      message += `Setting risk level to ${entities.riskLevel}. `;
      configManager.set('riskLevel', entities.riskLevel);
    }
    
    if (entities.amount) {
      message += `Maximum daily loss set to $${entities.amount}. `;
      configManager.set('maxDailyLoss', entities.amount);
    }
    
    if (entities.percentage) {
      message += `Using ${entities.percentage}% for position sizing. `;
    }
    
    message += "Would you like to adjust any other risk parameters?";
    
    return message;
  }

  /**
   * Generate status report
   * @returns {string} Status message
   */
  generateStatusResponse() {
    const config = configManager.getAll();
    const completedItems = [];
    
    if (config.apiUrl) completedItems.push('✓ API configured');
    if (config.riskLevel) completedItems.push('✓ Risk settings configured');
    if (config.features) completedItems.push('✓ Features selected');
    
    let message = "Here's your setup progress:\n\n";
    message += completedItems.join('\n');
    message += "\n\nWhat would you like to do next?";
    
    return message;
  }

  /**
   * Convert natural language command to action
   * @param {string} command - Natural language command
   * @returns {object} Action configuration
   */
  translateCommand(command) {
    const result = this.processInput(command);
    
    return {
      type: result.intent,
      parameters: result.entities,
      action: result.action,
      description: result.response
    };
  }

  /**
   * Get full conversation context for sharing with AI bot
   * @returns {object} Context data
   */
  getFullContext() {
    return {
      conversationHistory: this.context.conversationHistory,
      extractedData: this.context.extractedData,
      currentStep: this.context.currentStep,
      userPreferences: this.context.userPreferences,
      timestamp: Date.now()
    };
  }

  /**
   * Share context with AI bot
   * @param {object} aiBot - AI bot instance
   */
  shareContextWithAI(aiBot) {
    const context = this.getFullContext();
    
    if (aiBot && typeof aiBot.updateContext === 'function') {
      aiBot.updateContext(context);
    }
    
    return context;
  }

  /**
   * Reset conversation context
   */
  resetContext() {
    this.context = {
      currentStep: 'welcome',
      userPreferences: {},
      conversationHistory: [],
      extractedData: {}
    };
  }

  /**
   * Export conversation for analysis
   * @returns {string} JSON string of conversation
   */
  exportConversation() {
    return JSON.stringify(this.context, null, 2);
  }

  /**
   * Import conversation context
   * @param {string} contextJson - JSON string
   */
  importConversation(contextJson) {
    try {
      this.context = JSON.parse(contextJson);
      return true;
    } catch (error) {
      console.error('Error importing conversation:', error);
      return false;
    }
  }

  /**
   * Add message to conversation context
   * @param {string} role - 'user' or 'assistant'
   * @param {string} content - Message content
   */
  addToContext(role, content) {
    this.context.conversationHistory.push({
      role,
      content,
      timestamp: Date.now()
    });
    
    // Limit context size to last 20 messages
    if (this.context.conversationHistory.length > 20) {
      this.context.conversationHistory = this.context.conversationHistory.slice(-20);
    }
  }

  /**
   * Get conversation history
   * @returns {Array} Conversation history
   */
  getContext() {
    return this.context.conversationHistory;
  }

  /**
   * Clear conversation context
   */
  clearContext() {
    this.context.conversationHistory = [];
    this.context.extractedData = {};
  }

  /**
   * Translate natural language to command
   * @param {string} input - Natural language input
   * @returns {object|null} Command object or null
   */
  translateToCommand(input) {
    if (!input || input.trim().length === 0) {
      return null;
    }

    const intent = this.detectIntent(input);
    const entities = this.extractEntities(input);

    if (intent.name === 'unknown') {
      return null;
    }

    return {
      action: intent.action,
      intent: intent.name,
      parameters: entities,
      confidence: intent.confidence
    };
  }
}

// Singleton instance
const wizardProEngine = new WizardProEngine();

export default wizardProEngine;
export { WizardProEngine };
