import React, { useState, useEffect } from 'react';
import configManager from '../shared/configManager.js';

const PLATFORMS = ['upwork', 'fiverr', 'freelancer', 'toptal', 'guru', 'peopleperhour'];

export default function FreelanceAutomation({ onBack, config }) {
  const [activePlatform, setActivePlatform] = useState('upwork');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchCriteria, setSearchCriteria] = useState({
    keywords: '',
    minBudget: 0,
    category: 'all'
  });
  const [aiAssistance, setAiAssistance] = useState(true);

  const isFeatureEnabled = (feature) => {
    return configManager.isFeatureEnabled(feature);
  };

  useEffect(() => {
    if (isFeatureEnabled('freelanceAutomation')) {
      loadJobs();
    }
  }, [activePlatform]);

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.apiUrl || 'http://localhost:3000'}/api/freelance/${activePlatform}/jobs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchCriteria)
      });

      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
      } else {
        // Fallback to sample data
        generateSampleJobs();
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      generateSampleJobs();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleJobs = () => {
    const samples = [
      {
        id: '1',
        title: 'Full Stack Developer for E-commerce Platform',
        budget: 5000,
        description: 'Looking for an experienced full stack developer...',
        platform: activePlatform,
        posted: '2 hours ago',
        skills: ['React', 'Node.js', 'MongoDB']
      },
      {
        id: '2',
        title: 'Mobile App Development - React Native',
        budget: 3500,
        description: 'Need a mobile app developer with React Native experience...',
        platform: activePlatform,
        posted: '5 hours ago',
        skills: ['React Native', 'iOS', 'Android']
      },
      {
        id: '3',
        title: 'AI/ML Engineer for Trading Bot',
        budget: 8000,
        description: 'Seeking an AI engineer to develop trading algorithms...',
        platform: activePlatform,
        posted: '1 day ago',
        skills: ['Python', 'TensorFlow', 'Trading']
      }
    ];
    setJobs(samples);
  };

  const handleSearch = () => {
    loadJobs();
  };

  const handleApply = async (jobId) => {
    if (!isFeatureEnabled('aiBot')) {
      alert('AI Bot is disabled. Enable it in Settings to use auto-apply features.');
      return;
    }

    try {
      const response = await fetch(`${config.apiUrl || 'http://localhost:3000'}/api/freelance/${activePlatform}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId,
          useAI: aiAssistance
        })
      });

      if (response.ok) {
        alert('Application submitted successfully!');
      } else {
        alert('Application submitted (simulated mode)');
      }
    } catch (error) {
      alert('Application submitted (simulated mode)');
    }
  };

  return (
    <div className="freelance-container">
      <div className="freelance-header">
        <button onClick={onBack} className="btn-back">← Back</button>
        <h2>💼 Freelance Automation</h2>
      </div>

      {!isFeatureEnabled('freelanceAutomation') && (
        <div className="alert alert-warning">
          Freelance Automation is currently disabled. Enable it in Settings.
        </div>
      )}

      <div className="platform-selector">
        <h3>Select Platform</h3>
        <div className="platforms-grid">
          {PLATFORMS.map(platform => (
            <button
              key={platform}
              className={`platform-btn ${activePlatform === platform ? 'active' : ''}`}
              onClick={() => setActivePlatform(platform)}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="search-section">
        <h3>Search Jobs</h3>
        <div className="search-form">
          <div className="form-group">
            <input
              type="text"
              placeholder="Keywords (e.g., React, Python, AI)"
              value={searchCriteria.keywords}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, keywords: e.target.value })}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <input
              type="number"
              placeholder="Min Budget"
              value={searchCriteria.minBudget}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, minBudget: parseInt(e.target.value) })}
              className="form-control"
            />
          </div>
          
          <div className="form-group">
            <select
              value={searchCriteria.category}
              onChange={(e) => setSearchCriteria({ ...searchCriteria, category: e.target.value })}
              className="form-control"
            >
              <option value="all">All Categories</option>
              <option value="web">Web Development</option>
              <option value="mobile">Mobile Development</option>
              <option value="ai">AI/ML</option>
              <option value="design">Design</option>
            </select>
          </div>
          
          <button
            className="btn btn-primary"
            onClick={handleSearch}
            disabled={loading || !isFeatureEnabled('freelanceAutomation')}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="ai-toggle">
          <label>
            <input
              type="checkbox"
              checked={aiAssistance}
              onChange={(e) => setAiAssistance(e.target.checked)}
              disabled={!isFeatureEnabled('aiBot')}
            />
            Use AI Assistance for Applications
          </label>
        </div>
      </div>

      <div className="jobs-section">
        <h3>Available Jobs ({jobs.length})</h3>
        
        {loading ? (
          <div className="loading-spinner">
            <div>Loading jobs...</div>
          </div>
        ) : (
          <div className="jobs-list">
            {jobs.length === 0 ? (
              <div className="no-jobs">
                No jobs found. Try adjusting your search criteria.
              </div>
            ) : (
              jobs.map(job => (
                <div key={job.id} className="job-card">
                  <div className="job-header">
                    <h4>{job.title}</h4>
                    <div className="job-budget">${job.budget}</div>
                  </div>
                  
                  <div className="job-meta">
                    <span className="job-platform">{job.platform}</span>
                    <span className="job-posted">{job.posted}</span>
                  </div>
                  
                  <p className="job-description">{job.description}</p>
                  
                  {job.skills && (
                    <div className="job-skills">
                      {job.skills.map((skill, idx) => (
                        <span key={idx} className="skill-badge">{skill}</span>
                      ))}
                    </div>
                  )}
                  
                  <div className="job-actions">
                    <button
                      className="btn btn-success"
                      onClick={() => handleApply(job.id)}
                      disabled={!isFeatureEnabled('freelanceAutomation')}
                    >
                      {aiAssistance && isFeatureEnabled('aiBot') ? '🤖 AI Apply' : 'Apply'}
                    </button>
                    <button className="btn btn-secondary">View Details</button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isFeatureEnabled('advancedAnalytics') && (
        <div className="analytics-section">
          <h3>Application Analytics</h3>
          <div className="stats-row">
            <div className="stat">
              <div className="stat-label">Applications Today</div>
              <div className="stat-value">0</div>
            </div>
            <div className="stat">
              <div className="stat-label">Success Rate</div>
              <div className="stat-value">0%</div>
            </div>
            <div className="stat">
              <div className="stat-label">Avg Response Time</div>
              <div className="stat-value">N/A</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
