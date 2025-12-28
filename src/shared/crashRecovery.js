/**
 * Recovery utility module for crash recovery and backup
 */

import webhookManager from './webhookManager.js';

class RecoveryManager {
  constructor() {
    this.snapshots = [];
    this.maxSnapshots = 10;
    this.autoBackupEnabled = process.env.ENABLE_AUTO_RECOVERY === 'true';
  }

  /**
   * Deep clone an object efficiently
   * Uses structuredClone if available, falls back to JSON for compatibility
   * @param {object} obj - Object to clone
   * @returns {object} Cloned object
   */
  deepClone(obj) {
    // Use structuredClone for better performance when available (Node 17+, modern browsers)
    try {
      if (typeof structuredClone !== 'undefined') {
        return structuredClone(obj);
      }
    } catch (error) {
      // Fall through to JSON fallback if structuredClone check or call fails
      console.warn('structuredClone unavailable or failed, using JSON fallback:', error.message);
    }
    // Fallback to JSON for older environments or when structuredClone fails
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Create a system snapshot
   * @param {object} state - System state to snapshot
   * @returns {object} Snapshot metadata
   */
  createSnapshot(state) {
    const snapshot = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      state: this.deepClone(state)
    };

    this.snapshots.push(snapshot);

    // Keep only the last N snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      this.snapshots.shift();
    }

    // Trigger snapshot created webhook
    webhookManager.triggerEvent('snapshot.created', {
      snapshotId: snapshot.id,
      timestamp: snapshot.timestamp,
      stateSize: JSON.stringify(state).length
    }).catch(err => {
      console.error('Webhook delivery failed:', err);
    });

    return {
      id: snapshot.id,
      timestamp: snapshot.timestamp
    };
  }

  /**
   * Restore from a snapshot
   * @param {number} snapshotId - ID of snapshot to restore
   * @returns {object} Restored state
   */
  restoreSnapshot(snapshotId) {
    const snapshot = this.snapshots.find(snapshot => snapshot.id === snapshotId);
    if (!snapshot) {
      throw new Error(`Snapshot ${snapshotId} not found`);
    }
    return this.deepClone(snapshot.state);
  }

  /**
   * Get the most recent snapshot
   * @returns {object} Most recent snapshot
   */
  getLatestSnapshot() {
    if (this.snapshots.length === 0) {
      return null;
    }
    return this.snapshots[this.snapshots.length - 1];
  }

  /**
   * List all available snapshots
   * @returns {array} List of snapshot metadata
   */
  listSnapshots() {
    return this.snapshots.map(snapshot => ({
      id: snapshot.id,
      timestamp: snapshot.timestamp
    }));
  }

  /**
   * Clear all snapshots
   */
  clearSnapshots() {
    this.snapshots = [];
  }

  /**
   * Handle crash recovery
   * @param {Error} error - Error that caused the crash
   * @param {object} currentState - Current system state
   * @returns {object} Recovery result
   */
  handleCrash(error, currentState) {
    const crashReport = {
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        stack: error.stack
      },
      stateBeforeCrash: currentState
    };

    // Create emergency snapshot
    const emergencySnapshot = this.createSnapshot(currentState);

    return {
      crashReport,
      emergencySnapshot,
      recovered: true
    };
  }

  /**
   * Validate snapshot integrity
   * @param {number} snapshotId - ID of snapshot to validate
   * @returns {boolean} True if snapshot is valid
   */
  validateSnapshot(snapshotId) {
    const snapshot = this.snapshots.find(s => s.id === snapshotId);
    if (!snapshot) {
      return false;
    }
    return snapshot.state !== null && snapshot.state !== undefined;
  }

  /**
   * Export recovery data
   * @returns {object} All recovery data
   */
  export() {
    return {
      snapshots: this.snapshots,
      autoBackupEnabled: this.autoBackupEnabled,
      exportedAt: new Date().toISOString()
    };
  }
}

export default new RecoveryManager();
