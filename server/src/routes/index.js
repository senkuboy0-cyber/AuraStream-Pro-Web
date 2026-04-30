/**
 * AuraStream Pro Web - API Routes
 * 
 * This module exports all API route handlers.
 * Each route handles specific functionality:
 * - Health: Server health check
 * - Repository: Provider repository management
 * - Provider: Individual provider operations
 * - Search: Global search functionality
 * - Stream: Streaming proxy and resolution
 * - User: User management
 * - History: Watch history operations
 * 
 * @module routes
 */

import { Router } from 'express';

// Import route handlers
import healthRoutes from './health.routes.js';
import repositoryRoutes from './repository.routes.js';
import providerRoutes from './provider.routes.js';
import searchRoutes from './search.routes.js';
import streamRoutes from './stream.routes.js';
import userRoutes from './user.routes.js';
import historyRoutes from './history.routes.js';

/**
 * Create and configure the main API router
 * 
 * @param {Object} services - Application services (pluginEngine, streamResolver)
 * @returns {Router} Configured Express router
 */
export function createAPIRouter(services) {
  const router = Router();
  
  // Attach services to request object
  router.use((req, res, next) => {
    req.services = services;
    next();
  });
  
  // Mount route handlers
  router.use('/health', healthRoutes);
  router.use('/repositories', repositoryRoutes);
  router.use('/providers', providerRoutes);
  router.use('/search', searchRoutes);
  router.use('/stream', streamRoutes);
  router.use('/users', userRoutes);
  router.use('/history', historyRoutes);
  
  return router;
}

export default createAPIRouter;
