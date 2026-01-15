/**
 * Payment management module for handling transactions
 * Enhanced with archival functionality for completed payments
 */

import { isValidEthereumAddress } from '../shared/ethereumValidator.js';
import configManager from '../shared/configManager.js';

class PaymentManager {
  constructor() {
    this.transactions = [];
    this.balance = 0;
    this.pendingPayments = new Map();
    this.completedPayments = new Map(); // Archive completed payments
    this.cryptoPayouts = [];
  }

  /**
   * Process a payment
   * @param {object} paymentData - Payment details
   * @returns {object} Payment result
   */
  processPayment(paymentData) {
    const { amount, currency, recipient, method } = paymentData;

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    if (!recipient) {
      throw new Error('Recipient is required');
    }

    const transaction = {
      id: `txn_${Date.now()}`,
      amount,
      currency: currency || 'USD',
      recipient,
      method: method || 'bank_transfer',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.transactions.push(transaction);
    this.pendingPayments.set(transaction.id, transaction);

    // Simulate payment processing
    setTimeout(() => {
      this.confirmPayment(transaction.id);
    }, 1000);

    return transaction;
  }

  /**
   * Process crypto payout for completed job
   * @param {object} jobData - Job completion details
   * @returns {object} Payout transaction
   */
  processCryptoPayout(jobData) {
    const { jobId, amount, currency, platformName } = jobData;

    if (!amount || amount <= 0) {
      throw new Error('Invalid payout amount');
    }

    const cryptoAddress = configManager.get('cryptoPayoutAddress');
    const enableCrypto = configManager.get('enableCryptoPayouts');

    if (!enableCrypto) {
      throw new Error('Crypto payouts are disabled');
    }

    if (!isValidEthereumAddress(cryptoAddress)) {
      throw new Error('Invalid crypto payout address configured');
    }

    const payout = {
      id: `payout_${Date.now()}`,
      jobId,
      amount,
      currency: currency || 'USD',
      cryptoAddress,
      platformName: platformName || 'unknown',
      status: 'pending',
      type: 'crypto_payout',
      createdAt: new Date().toISOString()
    };

    this.cryptoPayouts.push(payout);
    this.transactions.push(payout);
    this.pendingPayments.set(payout.id, payout);

    // Simulate crypto payout processing
    const timeoutId = setTimeout(() => {
      try {
        this.confirmCryptoPayout(payout.id);
      } catch (error) {
        // Payout may have been manually confirmed or cancelled
      }
    }, 2000);
    
    // Store timeout ID for cleanup
    payout.timeoutId = timeoutId;

    return payout;
  }

  /**
   * Confirm crypto payout
   * @param {string} payoutId - Payout ID
   * @returns {object} Updated payout
   */
  confirmCryptoPayout(payoutId) {
    const payout = this.pendingPayments.get(payoutId);
    
    if (!payout) {
      throw new Error('Payout not found');
    }

    if (payout.type !== 'crypto_payout') {
      throw new Error('Not a crypto payout transaction');
    }

    // Clear timeout if it exists
    if (payout.timeoutId) {
      clearTimeout(payout.timeoutId);
      delete payout.timeoutId;
    }

    payout.status = 'completed';
    payout.completedAt = new Date().toISOString();
    payout.txHash = `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`;
    
    // Archive completed payout instead of just deleting from pending
    this.completedPayments.set(payoutId, { ...payout, type: 'payout' });
    this.pendingPayments.delete(payoutId);

    return payout;
  }

  /**
   * Confirm a payment
   * @param {string} transactionId - Transaction ID
   * @returns {object} Updated transaction
   */
  confirmPayment(transactionId) {
    const transaction = this.pendingPayments.get(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date().toISOString();
    
    // Archive completed payment instead of just deleting from pending
    this.completedPayments.set(transactionId, { ...transaction, type: 'payment' });
    this.pendingPayments.delete(transactionId);

    return transaction;
  }

  /**
   * Cancel a payment
   * @param {string} transactionId - Transaction ID
   * @returns {boolean} Success status
   */
  cancelPayment(transactionId) {
    const transaction = this.pendingPayments.get(transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    if (transaction.status === 'completed') {
      throw new Error('Cannot cancel completed payment');
    }

    transaction.status = 'cancelled';
    transaction.cancelledAt = new Date().toISOString();
    
    // Archive cancelled payment instead of just deleting
    this.completedPayments.set(transactionId, { ...transaction, type: 'cancelled_payment' });
    this.pendingPayments.delete(transactionId);

    return true;
  }

  /**
   * Receive a payment (credit account)
   * @param {object} paymentData - Payment details
   * @returns {object} Transaction record
   */
  receivePayment(paymentData) {
    const { amount, source, currency } = paymentData;

    if (!amount || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const transaction = {
      id: `txn_${Date.now()}`,
      type: 'credit',
      amount,
      currency: currency || 'USD',
      source: source || 'external',
      status: 'completed',
      createdAt: new Date().toISOString()
    };

    this.balance += amount;
    this.transactions.push(transaction);

    return transaction;
  }

  /**
   * Get transaction history
   * @param {object} filters - Filter options
   * @returns {array} Filtered transactions
   */
  getTransactions(filters = {}) {
    let transactions = [...this.transactions];

    if (filters.status) {
      transactions = transactions.filter(transaction => transaction.status === filters.status);
    }

    if (filters.type) {
      transactions = transactions.filter(transaction => transaction.type === filters.type);
    }

    if (filters.limit) {
      transactions = transactions.slice(-filters.limit);
    }

    return transactions;
  }

  /**
   * Get transaction by ID
   * @param {string} transactionId - Transaction ID
   * @returns {object} Transaction
   */
  getTransaction(transactionId) {
    const transaction = this.transactions.find(transaction => transaction.id === transactionId);
    
    if (!transaction) {
      throw new Error('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get account balance
   * @returns {number} Current balance
   */
  getBalance() {
    return this.balance;
  }

  /**
   * Get pending payments
   * @returns {array} Pending payments
   */
  getPendingPayments() {
    return Array.from(this.pendingPayments.values());
  }

  /**
   * Calculate total processed amount
   * @param {string} period - Time period ('daily', 'weekly', 'monthly')
   * @returns {number} Total amount
   */
  calculateTotalProcessed(period = 'daily') {
    const now = new Date();
    let cutoffDate;

    switch (period) {
      case 'daily':
        cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        cutoffDate = new Date(0);
    }

    return this.transactions
      .filter(transaction => new Date(transaction.createdAt) >= cutoffDate && transaction.status === 'completed')
      .reduce((sum, transaction) => sum + transaction.amount, 0);
  }

  /**
   * Get payment statistics
   * @returns {object} Payment statistics
   */
  getStatistics() {
    const total = this.transactions.length;
    const completed = this.transactions.filter(transaction => transaction.status === 'completed').length;
    const pending = this.pendingPayments.size;
    const cancelled = this.transactions.filter(transaction => transaction.status === 'cancelled').length;
    const cryptoPayoutsCompleted = this.cryptoPayouts.filter(p => p.status === 'completed').length;
    const cryptoPayoutsPending = this.cryptoPayouts.filter(p => p.status === 'pending').length;

    return {
      total,
      completed,
      pending,
      cancelled,
      balance: this.balance,
      dailyVolume: this.calculateTotalProcessed('daily'),
      cryptoPayouts: {
        total: this.cryptoPayouts.length,
        completed: cryptoPayoutsCompleted,
        pending: cryptoPayoutsPending,
        address: configManager.get('cryptoPayoutAddress')
      }
    };
  }

  /**
   * Get crypto payout address
   * @returns {string} Ethereum address
   */
  getCryptoPayoutAddress() {
    return configManager.get('cryptoPayoutAddress');
  }

  /**
   * Get all crypto payouts
   * @param {object} filters - Filter options
   * @returns {array} Filtered crypto payouts
   */
  getCryptoPayouts(filters = {}) {
    let payouts = [...this.cryptoPayouts];

    if (filters.status) {
      payouts = payouts.filter(payout => payout.status === filters.status);
    }

    if (filters.limit) {
      payouts = payouts.slice(-filters.limit);
    }

    return payouts;
  }
}

export default new PaymentManager();
export { PaymentManager };
