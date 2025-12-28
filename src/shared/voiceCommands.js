/**
 * Voice Command Manager
 * Handles speech recognition and voice commands for Wizard Pro
 */

export class VoiceCommandManager {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.listeners = new Map();
    this.language = 'en-US';
    this.continuous = false;
    this.interimResults = true;
    
    this.initializeRecognition();
  }

  /**
   * Initialize Speech Recognition
   */
  initializeRecognition() {
    /* eslint-disable no-undef */
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      this.recognition = new webkitSpeechRecognition();
    } else if (typeof window !== 'undefined' && 'SpeechRecognition' in window) {
      this.recognition = new SpeechRecognition();
    } else {
      console.warn('Speech recognition not supported in this browser');
      return;
    }
    /* eslint-enable no-undef */

    this.recognition.continuous = this.continuous;
    this.recognition.interimResults = this.interimResults;
    this.recognition.lang = this.language;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.emit('start');
    };

    this.recognition.onend = () => {
      this.isListening = false;
      this.emit('end');
    };

    this.recognition.onresult = (event) => {
      this.handleResult(event);
    };

    this.recognition.onerror = (event) => {
      this.emit('error', event.error);
    };
  }

  /**
   * Check if speech recognition is supported
   */
  isSupported() {
    return this.recognition !== null;
  }

  /**
   * Start listening
   */
  startListening() {
    if (!this.isSupported()) {
      throw new Error('Speech recognition not supported');
    }

    if (!this.isListening) {
      this.recognition.start();
    }
  }

  /**
   * Stop listening
   */
  stopListening() {
    if (this.isListening) {
      this.recognition.stop();
    }
  }

  /**
   * Toggle listening state
   */
  toggleListening() {
    if (this.isListening) {
      this.stopListening();
    } else {
      this.startListening();
    }
  }

  /**
   * Handle recognition result
   */
  handleResult(event) {
    const results = event.results;
    const lastResult = results[results.length - 1];
    const transcript = lastResult[0].transcript;
    const isFinal = lastResult.isFinal;
    const confidence = lastResult[0].confidence;

    const result = {
      transcript,
      isFinal,
      confidence
    };

    if (isFinal) {
      this.emit('final', result);
      this.processCommand(transcript);
    } else {
      this.emit('interim', result);
    }
  }

  /**
   * Process voice command
   */
  processCommand(transcript) {
    const command = transcript.toLowerCase().trim();
    
    // Trading commands
    if (command.includes('buy') || command.includes('sell')) {
      this.handleTradingCommand(command);
    }
    // Navigation commands
    else if (command.includes('go to') || command.includes('open')) {
      this.handleNavigationCommand(command);
    }
    // Feature toggle commands
    else if (command.includes('enable') || command.includes('disable')) {
      this.handleFeatureToggleCommand(command);
    }
    // Configuration commands
    else if (command.includes('set') || command.includes('configure')) {
      this.handleConfigurationCommand(command);
    }
    // Help commands
    else if (command.includes('help') || command.includes('what can')) {
      this.handleHelpCommand(command);
    }
    // General command
    else {
      this.emit('command', { command, type: 'general' });
    }
  }

  /**
   * Handle trading command
   */
  handleTradingCommand(command) {
    const action = command.includes('buy') ? 'buy' : 'sell';
    const amountMatch = command.match(/(\d+(\.\d+)?)/);
    const amount = amountMatch ? parseFloat(amountMatch[1]) : null;
    
    // Extract trading pair
    const pairMatch = command.match(/(bitcoin|btc|ethereum|eth|[a-z]{3,6})/i);
    const pair = pairMatch ? pairMatch[1].toUpperCase() : null;

    this.emit('command', {
      command,
      type: 'trading',
      action,
      amount,
      pair
    });

    this.speak(`Processing ${action} order${amount ? ` for ${amount}` : ''}${pair ? ` ${pair}` : ''}`);
  }

  /**
   * Handle navigation command
   */
  handleNavigationCommand(command) {
    const destinations = {
      'dashboard': 'dashboard',
      'settings': 'settings',
      'trading': 'trading',
      'freelance': 'freelance',
      'analytics': 'analytics',
      'test lab': 'testlab'
    };

    let destination = null;
    for (const [key, value] of Object.entries(destinations)) {
      if (command.includes(key)) {
        destination = value;
        break;
      }
    }

    if (destination) {
      this.emit('command', {
        command,
        type: 'navigation',
        destination
      });
      this.speak(`Navigating to ${destination}`);
    }
  }

  /**
   * Handle feature toggle command
   */
  handleFeatureToggleCommand(command) {
    const action = command.includes('enable') ? 'enable' : 'disable';
    
    const features = {
      'quantum engine': 'quantumEngine',
      'ai bot': 'aiBot',
      'wizard': 'wizardPro',
      'risk management': 'riskManagement',
      'analytics': 'advancedAnalytics'
    };

    let feature = null;
    for (const [key, value] of Object.entries(features)) {
      if (command.includes(key)) {
        feature = value;
        break;
      }
    }

    if (feature) {
      this.emit('command', {
        command,
        type: 'feature-toggle',
        action,
        feature
      });
      this.speak(`${action === 'enable' ? 'Enabling' : 'Disabling'} ${feature}`);
    }
  }

  /**
   * Handle configuration command
   */
  handleConfigurationCommand(command) {
    const settings = {};
    
    // Extract risk level
    if (command.includes('risk')) {
      if (command.includes('low')) settings.risk = 'low';
      else if (command.includes('moderate')) settings.risk = 'moderate';
      else if (command.includes('high')) settings.risk = 'high';
    }

    // Extract amount/position size
    const amountMatch = command.match(/(\d+(\.\d+)?)/);
    if (amountMatch) {
      settings.amount = parseFloat(amountMatch[1]);
    }

    this.emit('command', {
      command,
      type: 'configuration',
      settings
    });

    this.speak('Updating configuration');
  }

  /**
   * Handle help command
   */
  handleHelpCommand(command) {
    this.emit('command', {
      command,
      type: 'help'
    });

    const helpMessage = `
      You can say commands like:
      Buy 100 Bitcoin,
      Go to dashboard,
      Enable quantum engine,
      Set risk to moderate,
      or ask for help anytime.
    `;

    this.speak(helpMessage);
  }

  /**
   * Speak text using Text-to-Speech
   */
  speak(text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('Speech synthesis not supported');
      return;
    }

    // Cancel any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || this.language;
    utterance.rate = options.rate || 1.0;
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 1.0;

    if (options.voice) {
      utterance.voice = options.voice;
    }

    utterance.onstart = () => {
      this.emit('speech-start', { text });
    };

    utterance.onend = () => {
      this.emit('speech-end', { text });
    };

    utterance.onerror = (event) => {
      this.emit('speech-error', event);
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Stop speaking
   */
  stopSpeaking() {
    this.synthesis.cancel();
  }

  /**
   * Get available voices
   */
  getVoices() {
    return this.synthesis.getVoices();
  }

  /**
   * Set language
   */
  setLanguage(lang) {
    this.language = lang;
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  /**
   * Set continuous mode
   */
  setContinuous(continuous) {
    this.continuous = continuous;
    if (this.recognition) {
      this.recognition.continuous = continuous;
    }
  }

  /**
   * Add event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event);
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit event
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} listener:`, error);
        }
      });
    }
  }

  /**
   * Get listening status
   */
  getStatus() {
    return {
      isListening: this.isListening,
      isSupported: this.isSupported(),
      language: this.language,
      continuous: this.continuous
    };
  }
}

// Create singleton instance
export const voiceCommands = new VoiceCommandManager();
