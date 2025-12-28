import React, { useState, useEffect, useRef } from 'react';
import wizardProEngine from '../shared/wizardProEngine.js';
import configManager from '../shared/configManager.js';

export default function WizardPro({ onComplete, onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize with welcome message
    addMessage('assistant', 
      "👋 Welcome to Wizard Pro! I'm your AI assistant for setting up NDAX Quantum Engine.\n\n" +
      "I can help you:\n" +
      "• Configure trading and freelance automation\n" +
      "• Set up API keys and credentials\n" +
      "• Adjust risk and performance settings\n" +
      "• Enable or disable features\n\n" +
      "Just tell me what you'd like to do in plain English!",
      ['Start Setup', 'Get Help', 'Show Features']
    );
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const addMessage = (role, content, newSuggestions = []) => {
    setMessages(prev => [...prev, {
      role,
      content,
      timestamp: Date.now()
    }]);
    
    if (newSuggestions.length > 0) {
      setSuggestions(newSuggestions);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setIsProcessing(true);

    // Add user message
    addMessage('user', userMessage);

    // Process with Wizard Pro Engine
    try {
      const result = wizardProEngine.processInput(userMessage);
      
      // Add assistant response
      setTimeout(() => {
        addMessage('assistant', result.response, result.suggestions);
        
        // Handle specific actions
        handleAction(result);
        
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error('Error processing input:', error);
      addMessage('assistant', 
        "I encountered an error processing that. Could you try rephrasing?",
        ['Try Again', 'Get Help']
      );
      setIsProcessing(false);
    }
  };

  const handleAction = (result) => {
    switch (result.action) {
      case 'finalize':
        // Complete setup after a delay
        setTimeout(() => {
          if (onComplete) {
            onComplete(configManager.getAll());
          }
        }, 2000);
        break;
        
      case 'configureTradingSettings':
        // Apply trading settings from entities
        if (result.entities.riskLevel) {
          configManager.set('riskLevel', result.entities.riskLevel);
        }
        if (result.entities.amount) {
          configManager.set('maxPositionSize', result.entities.amount);
        }
        if (result.entities.tradingPair) {
          configManager.set('defaultTradingPair', result.entities.tradingPair);
        }
        break;
        
      case 'configureFreelanceSettings':
        // Apply freelance settings
        if (result.entities.amount) {
          configManager.set('minJobBudget', result.entities.amount);
        }
        if (result.entities.platform) {
          // Enable specific platform
          const platforms = configManager.get('platforms') || [];
          if (!platforms.includes(result.entities.platform)) {
            platforms.push(result.entities.platform);
            configManager.set('platforms', platforms);
          }
        }
        break;
        
      case 'configureRiskSettings':
        // Apply risk settings
        if (result.entities.riskLevel) {
          configManager.set('riskLevel', result.entities.riskLevel);
        }
        if (result.entities.amount) {
          configManager.set('maxDailyLoss', result.entities.amount);
        }
        break;
        
      default:
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
    setTimeout(() => handleSend(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleExportConversation = () => {
    const exported = wizardProEngine.exportConversation();
    const blob = new Blob([exported], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = `wizard-pro-conversation-${Date.now()}.json`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the conversation?')) {
      wizardProEngine.resetContext();
      setMessages([]);
      setSuggestions([]);
      // Re-initialize
      addMessage('assistant', 
        "Conversation reset. Let's start fresh! What would you like to set up?",
        ['Trading', 'Freelance', 'Both', 'Help']
      );
    }
  };

  return (
    <div className="wizard-pro-container">
      <div className="wizard-pro-header">
        {onBack && (
          <button onClick={onBack} className="btn-back">← Back</button>
        )}
        <h2>🧙 Wizard Pro - AI Assistant</h2>
        <div className="header-actions">
          <button onClick={handleExportConversation} className="btn btn-secondary">
            Export
          </button>
          <button onClick={handleReset} className="btn btn-secondary">
            Reset
          </button>
        </div>
      </div>

      <div className="wizard-pro-content">
        <div className="messages-container">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'assistant' ? '🧙' : '👤'}
              </div>
              <div className="message-content">
                <div className="message-text">{message.content}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isProcessing && (
            <div className="message assistant">
              <div className="message-avatar">🧙</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {suggestions.length > 0 && (
          <div className="suggestions-container">
            <div className="suggestions-label">Quick actions:</div>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className="suggestion-btn"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isProcessing}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="input-container">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here... (e.g., 'Set up trading with moderate risk' or 'Connect to Upwork')"
            className="message-input"
            rows={2}
            disabled={isProcessing}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isProcessing}
            className="btn btn-primary send-btn"
          >
            {isProcessing ? 'Processing...' : 'Send'}
          </button>
        </div>

        <div className="wizard-pro-info">
          <div className="info-item">
            💡 <strong>Tip:</strong> You can use natural language! Try &apos;I want to trade Bitcoin with $5000 max position&apos;
          </div>
          <div className="info-item">
            🔒 <strong>Privacy:</strong> All data is processed locally and encrypted
          </div>
        </div>
      </div>
    </div>
  );
}
