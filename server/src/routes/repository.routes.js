/**
 * Repository Management Routes
 * 
 * Handles CRUD operations for provider repositories.
 * Repositories contain multiple streaming providers.
 */

import { Router } from 'express';
import { Repository } from '../models/index.js';

const router = Router();

/**
 * GET /api/repositories
 * List all installed repositories
 */
router.get('/', async (req, res) => {
  try {
    const { isActive, limit = 50, skip = 0 } = req.query;
    
    const query = {};
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    const repositories = await Repository.find(query)
      .sort({ installedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Repository.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: repositories,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + repositories.length < total
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
 * GET /api/repositories/:id
 * Get a specific repository by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: repository
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/repositories
 * Add a new repository
 * 
 * Body:
 *   url: string - GitHub raw URL to repo.json
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Repository URL is required'
      });
    }
    
    // Validate URL format
    if (!url.includes('github.com') || !url.includes('raw')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid GitHub raw URL format'
      });
    }
    
    // Check if repository already exists
    const existing = await Repository.findOne({ url });
    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Repository already installed',
        data: existing
      });
    }
    
    // Fetch and validate repository metadata
    const pluginEngine = req.services?.pluginEngine;
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    let repoData;
    try {
      repoData = await pluginEngine.fetchRepository(url);
    } catch (fetchError) {
      return res.status(400).json({
        success: false,
        error: `Failed to fetch repository: ${fetchError.message}`
      });
    }
    
    // Create repository record
    const repository = new Repository({
      name: repoData.name,
      description: repoData.description || '',
      url,
      version: repoData.version || '1.0.0',
      providerCount: repoData.providers?.length || 0,
      providers: repoData.providers || []
    });
    
    await repository.save();
    
    // Load providers into plugin engine
    try {
      await pluginEngine.loadRepository(url);
    } catch (loadError) {
      req.services?.logger?.warn(`Some providers failed to load: ${loadError.message}`);
    }
    
    res.status(201).json({
      success: true,
      message: 'Repository installed successfully',
      data: repository
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/repositories/:id
 * Update a repository (e.g., enable/disable)
 */
router.put('/:id', async (req, res) => {
  try {
    const { isActive, name } = req.body;
    const updates = {};
    
    if (isActive !== undefined) {
      updates.isActive = isActive;
    }
    
    if (name) {
      updates.name = name;
    }
    
    const repository = await Repository.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }
    
    // Update plugin engine state
    const pluginEngine = req.services?.pluginEngine;
    if (pluginEngine) {
      if (isActive === false) {
        pluginEngine.unloadRepository(repository.url);
      } else if (isActive === true) {
        await pluginEngine.loadRepository(repository.url);
      }
    }
    
    res.status(200).json({
      success: true,
      message: 'Repository updated successfully',
      data: repository
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/repositories/:id
 * Remove a repository and unload its providers
 */
router.delete('/:id', async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }
    
    // Unload providers from plugin engine
    const pluginEngine = req.services?.pluginEngine;
    if (pluginEngine) {
      const unloadedCount = pluginEngine.unloadRepository(repository.url);
      req.services?.logger?.info(`Unloaded ${unloadedCount} providers from ${repository.name}`);
    }
    
    // Remove from database
    await Repository.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Repository removed successfully',
      data: { name: repository.name }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/repositories/:id/refresh
 * Refresh repository providers
 */
router.post('/:id/refresh', async (req, res) => {
  try {
    const repository = await Repository.findById(req.params.id);
    
    if (!repository) {
      return res.status(404).json({
        success: false,
        error: 'Repository not found'
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    // Unload existing providers
    pluginEngine.unloadRepository(repository.url);
    
    // Fetch fresh data
    const repoData = await pluginEngine.fetchRepository(repository.url);
    
    // Reload providers
    const providers = await pluginEngine.loadRepository(repository.url);
    
    // Update repository record
    repository.providerCount = providers.length;
    repository.providers = repoData.providers || [];
    repository.lastUpdated = new Date();
    await repository.save();
    
    res.status(200).json({
      success: true,
      message: 'Repository refreshed successfully',
      data: {
        ...repository.toObject(),
        providersLoaded: providers.length
      }
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
