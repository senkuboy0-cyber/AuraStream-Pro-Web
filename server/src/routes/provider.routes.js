/**
 * Provider Management Routes
 * 
 * Handles operations for individual streaming providers.
 * Providers are loaded from installed repositories.
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/providers
 * List all loaded providers
 */
router.get('/', async (req, res) => {
  try {
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    const providers = pluginEngine.getAllProviders();
    
    res.status(200).json({
      success: true,
      data: providers,
      count: providers.length
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/providers/:id
 * Get details of a specific provider
 */
router.get('/:id', async (req, res) => {
  try {
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    const providers = pluginEngine.getAllProviders();
    const provider = providers.find(p => p.id === req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: provider
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/providers/:id/capabilities
 * Get provider capabilities
 */
router.get('/:id/capabilities', async (req, res) => {
  try {
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    const providers = pluginEngine.getAllProviders();
    const provider = providers.find(p => p.id === req.params.id);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: provider.id,
        name: provider.name,
        capabilities: provider.capabilities
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/providers/:id/search
 * Search using a specific provider
 */
router.post('/:id/search', async (req, res) => {
  try {
    const { query, type } = req.body;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    const results = await pluginEngine.search(query, {
      providerIds: [req.params.id],
      type
    });
    
    res.status(200).json({
      success: true,
      query,
      results
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
