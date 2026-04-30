/**
 * Health Check Routes
 * 
 * Provides endpoints for monitoring server health and status.
 * Used by load balancers and monitoring systems.
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/health
 * Basic health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AuraStream API',
    version: '1.0.0'
  });
});

/**
 * GET /api/health/detailed
 * Detailed health information including dependencies
 */
router.get('/detailed', async (req, res) => {
  const mongoose = req.app.locals?.mongoose || null;
  const pluginEngine = req.services?.pluginEngine;
  
  const health = {
    success: true,
    timestamp: new Date().toISOString(),
    service: 'AuraStream API',
    version: '1.0.0',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    dependencies: {
      mongodb: {
        status: mongoose?.connection?.readyState === 1 ? 'connected' : 'disconnected'
      },
      pluginEngine: {
        status: 'running',
        providersLoaded: pluginEngine?.getProviderCount() || 0
      }
    }
  };
  
  res.status(200).json(health);
});

/**
 * GET /api/health/ready
 * Readiness probe for container orchestration
 */
router.get('/ready', async (req, res) => {
  const pluginEngine = req.services?.pluginEngine;
  
  // Check if server is ready to accept traffic
  const isReady = pluginEngine?.getProviderCount() >= 0;
  
  res.status(isReady ? 200 : 503).json({
    ready: isReady,
    timestamp: new Date().toISOString()
  });
});

/**
 * GET /api/health/live
 * Liveness probe for container orchestration
 */
router.get('/live', (req, res) => {
  res.status(200).json({
    alive: true,
    timestamp: new Date().toISOString()
  });
});

export default router;
