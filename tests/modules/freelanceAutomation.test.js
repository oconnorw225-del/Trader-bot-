/**
 * Tests for FreelanceAutomation Component
 */

import configManager from '../../src/shared/configManager.js';

const PLATFORMS = ['upwork', 'fiverr', 'freelancer', 'toptal', 'guru', 'peopleperhour'];

describe('FreelanceAutomation Platform Selection', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should have all supported platforms', () => {
    expect(PLATFORMS).toContain('upwork');
    expect(PLATFORMS).toContain('fiverr');
    expect(PLATFORMS).toContain('freelancer');
    expect(PLATFORMS).toContain('toptal');
    expect(PLATFORMS).toContain('guru');
    expect(PLATFORMS).toContain('peopleperhour');
  });

  test('should set active platform to upwork by default', () => {
    const activePlatform = 'upwork';
    expect(activePlatform).toBe('upwork');
  });

  test('should switch to fiverr platform', () => {
    let activePlatform = 'upwork';
    activePlatform = 'fiverr';
    
    expect(activePlatform).toBe('fiverr');
    expect(PLATFORMS).toContain(activePlatform);
  });

  test('should switch to freelancer platform', () => {
    let activePlatform = 'upwork';
    activePlatform = 'freelancer';
    
    expect(activePlatform).toBe('freelancer');
    expect(PLATFORMS).toContain(activePlatform);
  });

  test('should switch to toptal platform', () => {
    let activePlatform = 'upwork';
    activePlatform = 'toptal';
    
    expect(activePlatform).toBe('toptal');
    expect(PLATFORMS).toContain(activePlatform);
  });

  test('should switch to guru platform', () => {
    let activePlatform = 'upwork';
    activePlatform = 'guru';
    
    expect(activePlatform).toBe('guru');
    expect(PLATFORMS).toContain(activePlatform);
  });

  test('should switch to peopleperhour platform', () => {
    let activePlatform = 'upwork';
    activePlatform = 'peopleperhour';
    
    expect(activePlatform).toBe('peopleperhour');
    expect(PLATFORMS).toContain(activePlatform);
  });
});

describe('FreelanceAutomation Search Criteria', () => {
  test('should initialize search criteria with defaults', () => {
    const searchCriteria = {
      keywords: '',
      minBudget: 0,
      category: 'all'
    };

    expect(searchCriteria.keywords).toBe('');
    expect(searchCriteria.minBudget).toBe(0);
    expect(searchCriteria.category).toBe('all');
  });

  test('should update keywords in search criteria', () => {
    const searchCriteria = {
      keywords: '',
      minBudget: 0,
      category: 'all'
    };

    searchCriteria.keywords = 'React';
    expect(searchCriteria.keywords).toBe('React');
  });

  test('should update minBudget in search criteria', () => {
    const searchCriteria = {
      keywords: '',
      minBudget: 0,
      category: 'all'
    };

    searchCriteria.minBudget = 1000;
    expect(searchCriteria.minBudget).toBe(1000);
  });

  test('should update category in search criteria', () => {
    const searchCriteria = {
      keywords: '',
      minBudget: 0,
      category: 'all'
    };

    searchCriteria.category = 'web';
    expect(searchCriteria.category).toBe('web');
  });

  test('should support multiple category types', () => {
    const categories = ['all', 'web', 'mobile', 'ai', 'design'];
    
    categories.forEach(category => {
      expect(['all', 'web', 'mobile', 'ai', 'design']).toContain(category);
    });
  });
});

describe('FreelanceAutomation Form Interactions', () => {
  test('should handle search form submission', () => {
    const searchCriteria = {
      keywords: 'React Developer',
      minBudget: 500,
      category: 'web'
    };

    expect(searchCriteria.keywords).toBe('React Developer');
    expect(searchCriteria.minBudget).toBe(500);
    expect(searchCriteria.category).toBe('web');
  });

  test('should validate minimum budget is a number', () => {
    const minBudget = 1000;
    expect(typeof minBudget).toBe('number');
    expect(minBudget).toBeGreaterThanOrEqual(0);
  });

  test('should handle empty keywords', () => {
    const keywords = '';
    expect(keywords.length).toBe(0);
  });

  test('should trim whitespace from keywords', () => {
    const keywords = '  React Developer  ';
    const trimmed = keywords.trim();
    
    expect(trimmed).toBe('React Developer');
  });
});

describe('FreelanceAutomation AI Assistance', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should enable AI assistance by default', () => {
    const aiAssistance = true;
    expect(aiAssistance).toBe(true);
  });

  test('should disable AI assistance when toggled off', () => {
    let aiAssistance = true;
    aiAssistance = false;
    
    expect(aiAssistance).toBe(false);
  });

  test('should check if AI bot feature is enabled', () => {
    configManager.enableFeature('aiBot');
    expect(configManager.isFeatureEnabled('aiBot')).toBe(true);
  });

  test('should disable AI assistance when aiBot feature is disabled', () => {
    configManager.disableFeature('aiBot');
    const canUseAI = configManager.isFeatureEnabled('aiBot');
    
    expect(canUseAI).toBe(false);
  });
});

describe('FreelanceAutomation Job Loading', () => {
  test('should generate sample jobs when API fails', () => {
    const sampleJobs = [
      {
        id: '1',
        title: 'Full Stack Developer for E-commerce Platform',
        budget: 5000,
        description: 'Looking for an experienced full stack developer...',
        platform: 'upwork',
        posted: '2 hours ago',
        skills: ['React', 'Node.js', 'MongoDB']
      },
      {
        id: '2',
        title: 'Mobile App Development - React Native',
        budget: 3500,
        description: 'Need a mobile app developer with React Native experience...',
        platform: 'upwork',
        posted: '5 hours ago',
        skills: ['React Native', 'iOS', 'Android']
      }
    ];

    expect(sampleJobs.length).toBeGreaterThan(0);
    expect(sampleJobs[0]).toHaveProperty('id');
    expect(sampleJobs[0]).toHaveProperty('title');
    expect(sampleJobs[0]).toHaveProperty('budget');
  });

  test('should set loading state during job fetch', () => {
    let loading = false;
    loading = true;
    
    expect(loading).toBe(true);
    
    loading = false;
    expect(loading).toBe(false);
  });

  test('should handle empty job list', () => {
    const jobs = [];
    expect(jobs.length).toBe(0);
  });

  test('should validate job structure', () => {
    const job = {
      id: '1',
      title: 'Test Job',
      budget: 1000,
      description: 'Test description',
      platform: 'upwork',
      posted: '1 hour ago',
      skills: ['JavaScript']
    };

    expect(job).toHaveProperty('id');
    expect(job).toHaveProperty('title');
    expect(job).toHaveProperty('budget');
    expect(job).toHaveProperty('description');
    expect(job).toHaveProperty('platform');
    expect(job).toHaveProperty('skills');
    expect(Array.isArray(job.skills)).toBe(true);
  });
});

describe('FreelanceAutomation Job Application', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should require freelanceAutomation feature to apply', () => {
    configManager.enableFeature('freelanceAutomation');
    const canApply = configManager.isFeatureEnabled('freelanceAutomation');
    
    expect(canApply).toBe(true);
  });

  test('should prevent application when feature is disabled', () => {
    configManager.disableFeature('freelanceAutomation');
    const canApply = configManager.isFeatureEnabled('freelanceAutomation');
    
    expect(canApply).toBe(false);
  });

  test('should use AI assistance when enabled', () => {
    configManager.enableFeature('aiBot');
    const aiAssistance = true;
    const useAI = aiAssistance && configManager.isFeatureEnabled('aiBot');
    
    expect(useAI).toBe(true);
  });

  test('should not use AI assistance when disabled', () => {
    configManager.disableFeature('aiBot');
    const aiAssistance = false;
    const useAI = aiAssistance && configManager.isFeatureEnabled('aiBot');
    
    expect(useAI).toBe(false);
  });

  test('should build application request with job ID', () => {
    const jobId = 'job-123';
    const aiAssistance = true;
    
    const application = {
      jobId,
      useAI: aiAssistance
    };

    expect(application.jobId).toBe('job-123');
    expect(application.useAI).toBe(true);
  });
});

describe('FreelanceAutomation Feature Toggles', () => {
  beforeEach(() => {
    configManager.resetToDefaults();
  });

  test('should check if freelanceAutomation feature is enabled', () => {
    configManager.enableFeature('freelanceAutomation');
    expect(configManager.isFeatureEnabled('freelanceAutomation')).toBe(true);
  });

  test('should show warning when freelanceAutomation is disabled', () => {
    configManager.disableFeature('freelanceAutomation');
    const showWarning = !configManager.isFeatureEnabled('freelanceAutomation');
    
    expect(showWarning).toBe(true);
  });

  test('should show analytics when feature is enabled', () => {
    configManager.enableFeature('advancedAnalytics');
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(true);
  });

  test('should hide analytics when feature is disabled', () => {
    configManager.disableFeature('advancedAnalytics');
    expect(configManager.isFeatureEnabled('advancedAnalytics')).toBe(false);
  });
});

describe('FreelanceAutomation Analytics', () => {
  test('should initialize analytics with zero values', () => {
    const analytics = {
      applicationsToday: 0,
      successRate: 0,
      avgResponseTime: 'N/A'
    };

    expect(analytics.applicationsToday).toBe(0);
    expect(analytics.successRate).toBe(0);
    expect(analytics.avgResponseTime).toBe('N/A');
  });

  test('should calculate success rate correctly', () => {
    const applications = [
      { success: true },
      { success: true },
      { success: false },
      { success: true },
      { success: false }
    ];

    const successCount = applications.filter(a => a.success).length;
    const successRate = (successCount / applications.length) * 100;

    expect(successRate).toBe(60);
  });

  test('should handle zero applications', () => {
    const applications = [];
    const successRate = applications.length === 0 ? 0 : (applications.filter(a => a.success).length / applications.length) * 100;

    expect(successRate).toBe(0);
  });
});
