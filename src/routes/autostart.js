/**
 * Auto-Start Routes for Platform Integration
 * Provides API endpoints for autonomous job platform management
 */

import express from 'express';

const router = express.Router();

/**
 * Initialize the auto-start system
 * POST /autostart/initialize
 */
router.post('/initialize', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const result = await autoStartManager.start();
    
    res.json({
      success: result.success,
      status: result.status || 'running',
      message: 'Auto-start system initialized',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Stop the auto-start system
 * POST /autostart/stop
 */
router.post('/stop', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const result = autoStartManager.stop();
    
    res.json({
      success: result.success,
      status: result.status || 'stopped',
      message: 'Auto-start system stopped',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Emergency stop - stops system and cancels all active jobs
 * POST /autostart/emergency-stop
 */
router.post('/emergency-stop', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const result = await autoStartManager.emergencyStop();
    
    res.json({
      success: true,
      cancelledJobs: result.cancelledJobs,
      message: 'Emergency stop executed',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get all platform statuses
 * GET /platforms/status
 */
router.get('/platforms/status', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const platforms = autoStartManager.getPlatformStatuses();
    
    res.json({
      success: true,
      platforms,
      count: platforms.length,
      connected: platforms.filter(p => p.connected).length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Connect a platform with API key
 * POST /platforms/connect
 */
router.post('/platforms/connect', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const { platformId, apiKey } = req.body;
    
    if (!platformId || !apiKey) {
      return res.status(400).json({
        success: false,
        error: 'platformId and apiKey are required'
      });
    }

    const result = await autoStartManager.connectPlatform(platformId, apiKey);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Change job strategy
 * POST /strategy/change
 */
router.post('/strategy/change', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const { strategy } = req.body;
    
    if (!strategy) {
      return res.status(400).json({
        success: false,
        error: 'strategy is required'
      });
    }

    const result = autoStartManager.changeStrategy(strategy);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get available strategies
 * GET /strategy/list
 */
router.get('/strategy/list', async (req, res) => {
  try {
    const { AutoStartManager } = await import('../services/AutoStartManager.js');
    const strategies = AutoStartManager.getStrategies();
    
    res.json({
      success: true,
      strategies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get complete system status
 * GET /status/complete
 */
router.get('/status/complete', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const status = autoStartManager.getCompleteStatus();
    
    res.json({
      success: true,
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Approve a pending job
 * POST /jobs/:jobId/approve
 */
router.post('/jobs/:jobId/approve', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const { jobId } = req.params;
    
    const result = await autoStartManager.approveJob(jobId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Cancel an active job
 * POST /jobs/:jobId/cancel
 */
router.post('/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { autoStartManager } = req.app.locals;
    
    if (!autoStartManager) {
      return res.status(503).json({
        success: false,
        error: 'AutoStartManager not initialized'
      });
    }

    const { jobId } = req.params;
    
    const result = await autoStartManager.cancelJob(jobId);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Get platform configurations
 * GET /platforms/configs
 */
router.get('/platforms/configs', async (req, res) => {
  try {
    const { AutoStartManager } = await import('../services/AutoStartManager.js');
    const configs = AutoStartManager.getPlatformConfigs();
    
    res.json({
      success: true,
      platforms: configs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
