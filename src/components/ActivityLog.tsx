/**
 * Activity Log Component
 * Real-time activity feed showing trades, orders, and system events
 */

import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import '../styles/ActivityLog.css';

interface ActivityEvent {
  id: string;
  type: 'trade' | 'order' | 'position' | 'quantum' | 'ai' | 'system' | 'error';
  message: string;
  timestamp: Date;
  details?: any;
  severity?: 'info' | 'success' | 'warning' | 'error';
}

interface ActivityLogProps {
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ 
  maxItems = 50,
  autoRefresh = true,
  refreshInterval = 3000 
}) => {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    // Initialize with sample data
    addActivity({
      type: 'system',
      message: 'Activity log initialized',
      severity: 'info'
    });

    // Listen for custom events from other components
    const handleActivity = (event: CustomEvent<Omit<ActivityEvent, 'id' | 'timestamp'>>) => {
      addActivity(event.detail);
    };

    window.addEventListener('activity-log' as any, handleActivity as EventListener);

    return () => {
      window.removeEventListener('activity-log' as any, handleActivity as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!autoRefresh || isPaused) return;

    const interval = setInterval(() => {
      // Simulate periodic system updates
      const randomEvents = [
        { type: 'system' as const, message: 'System health check: OK', severity: 'success' as const },
        { type: 'quantum' as const, message: 'Quantum calculation completed', severity: 'info' as const },
        { type: 'ai' as const, message: 'AI model prediction updated', severity: 'info' as const },
      ];

      if (Math.random() > 0.7) {
        const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        addActivity(randomEvent);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, isPaused, refreshInterval]);

  const addActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
    const newActivity: ActivityEvent = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      ...event,
      severity: event.severity || 'info'
    };

    setActivities(prev => {
      const updated = [newActivity, ...prev];
      return updated.slice(0, maxItems);
    });
  };

  const clearActivities = () => {
    setActivities([]);
    addActivity({
      type: 'system',
      message: 'Activity log cleared',
      severity: 'info'
    });
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    return activities.filter(a => a.type === filter);
  };

  const getIconForType = (type: ActivityEvent['type']) => {
    const icons = {
      trade: '💱',
      order: '📋',
      position: '📊',
      quantum: '⚛️',
      ai: '🤖',
      system: '⚙️',
      error: '❌'
    };
    return icons[type] || '•';
  };

  const getSeverityClass = (severity: ActivityEvent['severity']) => {
    return `severity-${severity || 'info'}`;
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="activity-log">
      <div className="activity-log-header">
        <h3>Activity Log</h3>
        <div className="activity-log-controls">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Events</option>
            <option value="trade">Trades</option>
            <option value="order">Orders</option>
            <option value="position">Positions</option>
            <option value="quantum">Quantum</option>
            <option value="ai">AI</option>
            <option value="system">System</option>
            <option value="error">Errors</option>
          </select>
          
          <button 
            onClick={() => setIsPaused(!isPaused)}
            className={`btn btn-sm ${isPaused ? 'btn-success' : 'btn-warning'}`}
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? '▶️' : '⏸️'}
          </button>
          
          <button 
            onClick={clearActivities}
            className="btn btn-sm btn-danger"
            title="Clear log"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="activity-log-stats">
        <span className="stat">
          Total: <strong>{activities.length}</strong>
        </span>
        <span className="stat">
          Filtered: <strong>{filteredActivities.length}</strong>
        </span>
        <span className={`stat ${isPaused ? 'text-warning' : 'text-success'}`}>
          {isPaused ? '⏸️ Paused' : '▶️ Live'}
        </span>
      </div>

      <div className="activity-log-content">
        {filteredActivities.length === 0 ? (
          <div className="no-activities">
            <p>No activities to display</p>
          </div>
        ) : (
          <div className="activity-list">
            {filteredActivities.map((activity) => (
              <div 
                key={activity.id} 
                className={`activity-item ${getSeverityClass(activity.severity)}`}
              >
                <div className="activity-icon">
                  {getIconForType(activity.type)}
                </div>
                <div className="activity-content">
                  <div className="activity-message">{activity.message}</div>
                  <div className="activity-meta">
                    <span className="activity-type">{activity.type}</span>
                    <span className="activity-time">
                      {format(activity.timestamp, 'HH:mm:ss')}
                    </span>
                  </div>
                  {activity.details && (
                    <div className="activity-details">
                      <pre>{JSON.stringify(activity.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to dispatch activity events from other components
export const logActivity = (event: Omit<ActivityEvent, 'id' | 'timestamp'>) => {
  window.dispatchEvent(new CustomEvent('activity-log', { detail: event }));
};

export default ActivityLog;
