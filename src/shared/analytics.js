/**
 * Analytics utility module for tracking and monitoring
 */

class Analytics {
  constructor() {
    this.events = [];
    this.metrics = {};
    // Add configurable limits to prevent unbounded memory growth
    this.maxEvents = 1000;
    this.maxMetricValues = 500;
  }

  /**
   * Track an event
   * @param {string} eventName - Name of the event
   * @param {object} data - Event data
   */
  trackEvent(eventName, data = {}) {
    const event = {
      name: eventName,
      data,
      timestamp: new Date().toISOString()
    };
    this.events.push(event);
    
    // Keep only the most recent events to prevent memory leaks
    // Always use splice for consistent and efficient bulk removal
    if (this.events.length > this.maxEvents) {
      const excessCount = this.events.length - this.maxEvents;
      this.events.splice(0, excessCount);
    }
    
    return event;
  }

  /**
   * Record a metric
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   */
  recordMetric(metricName, value) {
    if (!this.metrics[metricName]) {
      this.metrics[metricName] = [];
    }
    this.metrics[metricName].push({
      value,
      timestamp: new Date().toISOString()
    });
    
    // Keep only the most recent metric values to prevent memory leaks
    // Always use splice for consistent and efficient bulk removal
    if (this.metrics[metricName].length > this.maxMetricValues) {
      const excessCount = this.metrics[metricName].length - this.maxMetricValues;
      this.metrics[metricName].splice(0, excessCount);
    }
  }

  /**
   * Get metric statistics
   * @param {string} metricName - Name of the metric
   * @returns {object} Statistics for the metric
   */
  getMetricStats(metricName) {
    const metricValues = this.metrics[metricName] || [];
    if (metricValues.length === 0) {
      return { count: 0, avg: 0, min: 0, max: 0 };
    }
    const numericValues = metricValues.map(metricEntry => metricEntry.value);
    return {
      count: numericValues.length,
      avg: numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length,
      min: Math.min(...numericValues),
      max: Math.max(...numericValues)
    };
  }

  /**
   * Get events by name
   * @param {string} eventName - Name of the event
   * @returns {array} Filtered events
   */
  getEventsByName(eventName) {
    return this.events.filter(event => event.name === eventName);
  }

  /**
   * Clear all analytics data
   */
  clear() {
    this.events = [];
    this.metrics = {};
  }

  /**
   * Export analytics data
   * @returns {object} All analytics data
   */
  export() {
    return {
      events: this.events,
      metrics: this.metrics,
      exportedAt: new Date().toISOString()
    };
  }
}

export default new Analytics();
