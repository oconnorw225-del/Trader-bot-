/**
 * Advanced AI Model Integration
 * Supports multiple AI providers: GPT-4, Claude, Gemini, Local models
 */

export class AdvancedAIManager {
  constructor() {
    this.providers = new Map();
    this.defaultProvider = 'openai';
    this.initializeProviders();
  }

  /**
   * Initialize AI providers
   */
  initializeProviders() {
    // OpenAI GPT-4
    this.providers.set('openai', {
      name: 'OpenAI GPT-4',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      endpoint: 'https://api.openai.com/v1/chat/completions',
      apiKey: process.env.OPENAI_API_KEY
    });

    // Anthropic Claude
    this.providers.set('anthropic', {
      name: 'Anthropic Claude',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-2'],
      endpoint: 'https://api.anthropic.com/v1/messages',
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    // Google Gemini
    this.providers.set('google', {
      name: 'Google Gemini',
      models: ['gemini-pro', 'gemini-pro-vision'],
      endpoint: 'https://generativelanguage.googleapis.com/v1/models',
      apiKey: process.env.GOOGLE_AI_KEY
    });

    // Local models (via Ollama or similar)
    this.providers.set('local', {
      name: 'Local Models',
      models: ['llama2', 'mistral', 'codellama'],
      endpoint: 'http://localhost:11434/api/generate',
      apiKey: null
    });
  }

  /**
   * Generate text completion
   */
  async generateCompletion(prompt, options = {}) {
    const provider = options.provider || this.defaultProvider;
    const model = options.model || this.getDefaultModel(provider);
    const temperature = options.temperature || 0.7;
    const maxTokens = options.maxTokens || 1000;

    const providerConfig = this.providers.get(provider);
    if (!providerConfig) {
      throw new Error(`Provider ${provider} not found`);
    }

    switch (provider) {
      case 'openai':
        return await this.generateOpenAI(prompt, model, temperature, maxTokens);
      case 'anthropic':
        return await this.generateClaude(prompt, model, temperature, maxTokens);
      case 'google':
        return await this.generateGemini(prompt, model, temperature, maxTokens);
      case 'local':
        return await this.generateLocal(prompt, model, temperature, maxTokens);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }

  /**
   * Generate with OpenAI
   */
  async generateOpenAI(prompt, model, temperature, maxTokens) {
    const provider = this.providers.get('openai');
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.choices[0].message.content,
      usage: data.usage,
      model: data.model,
      provider: 'openai'
    };
  }

  /**
   * Generate with Claude
   */
  async generateClaude(prompt, model, temperature, maxTokens) {
    const provider = this.providers.get('anthropic');
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.content[0].text,
      usage: data.usage,
      model: data.model,
      provider: 'anthropic'
    };
  }

  /**
   * Generate with Gemini
   */
  async generateGemini(prompt, model, temperature, maxTokens) {
    const provider = this.providers.get('google');
    
    const response = await fetch(`${provider.endpoint}/${model}:generateContent?key=${provider.apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.candidates[0].content.parts[0].text,
      usage: { total_tokens: data.usageMetadata?.totalTokenCount || 0 },
      model,
      provider: 'google'
    };
  }

  /**
   * Generate with local model
   */
  async generateLocal(prompt, model, temperature, maxTokens) {
    const provider = this.providers.get('local');
    
    const response = await fetch(provider.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        prompt,
        temperature,
        max_tokens: maxTokens,
        stream: false
      })
    });

    if (!response.ok) {
      throw new Error(`Local model error: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      text: data.response,
      usage: { total_tokens: 0 },
      model,
      provider: 'local'
    };
  }

  /**
   * Analyze trading data with AI
   */
  async analyzeTradingData(marketData, strategy) {
    const prompt = `
      Analyze the following market data and provide trading insights:
      
      Market Data: ${JSON.stringify(marketData, null, 2)}
      Strategy: ${strategy}
      
      Provide:
      1. Market sentiment analysis
      2. Key patterns or trends
      3. Risk assessment
      4. Trading recommendation (buy/sell/hold)
      5. Confidence level (0-100%)
    `;

    const result = await this.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });

    return this.parseAnalysis(result.text);
  }

  /**
   * Generate trading strategy
   */
  async generateStrategy(parameters) {
    const prompt = `
      Generate a trading strategy based on these parameters:
      ${JSON.stringify(parameters, null, 2)}
      
      Include:
      1. Entry conditions
      2. Exit conditions
      3. Risk management rules
      4. Position sizing
      5. Expected performance metrics
    `;

    const result = await this.generateCompletion(prompt, {
      temperature: 0.5,
      maxTokens: 1000
    });

    return result.text;
  }

  /**
   * Sentiment analysis for freelance proposals
   */
  async analyzeProposal(proposalText) {
    const prompt = `
      Analyze this freelance proposal for quality and competitiveness:
      
      "${proposalText}"
      
      Provide:
      1. Tone and professionalism score (0-10)
      2. Clarity and conciseness score (0-10)
      3. Competitiveness score (0-10)
      4. Suggested improvements
      5. Overall recommendation
    `;

    const result = await this.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: 500
    });

    return result.text;
  }

  /**
   * Generate improved proposal
   */
  async improveProposal(originalProposal, jobDescription) {
    const prompt = `
      Improve this freelance proposal for the given job description:
      
      Job: ${jobDescription}
      Original Proposal: ${originalProposal}
      
      Generate an improved version that is:
      1. More professional and engaging
      2. Better aligned with job requirements
      3. Clearer and more concise
      4. More competitive
    `;

    const result = await this.generateCompletion(prompt, {
      temperature: 0.7,
      maxTokens: 800
    });

    return result.text;
  }

  /**
   * Code review and suggestions
   */
  async reviewCode(code, language) {
    const prompt = `
      Review this ${language} code and provide suggestions:
      
      \`\`\`${language}
      ${code}
      \`\`\`
      
      Provide:
      1. Code quality assessment
      2. Potential bugs or issues
      3. Performance improvements
      4. Security concerns
      5. Best practices suggestions
    `;

    const result = await this.generateCompletion(prompt, {
      temperature: 0.3,
      maxTokens: 1000
    });

    return result.text;
  }

  /**
   * Parse analysis result
   */
  parseAnalysis(text) {
    // Extract structured data from AI response
    try {
      const analysis = {
        sentiment: this.extractValue(text, 'sentiment'),
        patterns: this.extractValue(text, 'patterns'),
        risk: this.extractValue(text, 'risk'),
        recommendation: this.extractValue(text, 'recommendation'),
        confidence: this.extractConfidence(text)
      };
      return analysis;
    } catch (error) {
      return { rawText: text };
    }
  }

  /**
   * Extract value from text
   */
  extractValue(text, key) {
    const regex = new RegExp(`${key}[:\\s]+(.*?)(?:\\n|$)`, 'i');
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  /**
   * Extract confidence percentage
   */
  extractConfidence(text) {
    const match = text.match(/(\d+)%/);
    return match ? parseInt(match[1]) : null;
  }

  /**
   * Get default model for provider
   */
  getDefaultModel(provider) {
    const providerConfig = this.providers.get(provider);
    return providerConfig ? providerConfig.models[0] : null;
  }

  /**
   * List available providers
   */
  listProviders() {
    return Array.from(this.providers.entries()).map(([key, config]) => ({
      id: key,
      name: config.name,
      models: config.models
    }));
  }

  /**
   * Set default provider
   */
  setDefaultProvider(provider) {
    if (!this.providers.has(provider)) {
      throw new Error(`Provider ${provider} not found`);
    }
    this.defaultProvider = provider;
  }

  /**
   * Get default provider
   */
  getDefaultProvider() {
    return this.defaultProvider;
  }
}

// Create singleton instance
export const advancedAI = new AdvancedAIManager();
