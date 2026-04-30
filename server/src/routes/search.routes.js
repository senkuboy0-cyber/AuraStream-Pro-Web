/**
 * Global Search Routes
 * 
 * Provides real-time search across all installed providers.
 * Uses Promise.allSettled to handle provider failures gracefully.
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/search
 * Global search across all providers
 * 
 * Query Parameters:
 *   q: string - Search query (required)
 *   type: string - Filter by type (movie, series, anime, all)
 *   limit: number - Maximum results per provider
 *   providers: string - Comma-separated provider IDs to search
 */
router.get('/', async (req, res) => {
  try {
    const { q, type = 'all', limit = 20, providers } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    // Parse provider IDs if provided
    const providerIds = providers 
      ? providers.split(',').filter(Boolean)
      : null;
    
    // Execute search
    const startTime = Date.now();
    const results = await pluginEngine.search(q.trim(), {
      type,
      limit: parseInt(limit),
      providerIds
    });
    const searchTime = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      query: q.trim(),
      results,
      meta: {
        total: results.length,
        searchTimeMs: searchTime,
        providersSearched: providerIds?.length || pluginEngine.getProviderCount()
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
 * POST /api/search
 * Advanced search with filters
 * 
 * Body:
 *   query: string - Search query
 *   type: string - Media type filter
 *   year: number - Release year filter
 *   genre: string - Genre filter
 *   limit: number - Max results
 *   providers: string[] - Provider IDs to search
 */
router.post('/', async (req, res) => {
  try {
    const { 
      query, 
      type = 'all', 
      year,
      genre,
      limit = 20,
      providers 
    } = req.body;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Search query must be at least 2 characters'
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    // Execute base search
    let results = await pluginEngine.search(query.trim(), {
      type,
      limit: 100, // Get more results for filtering
      providerIds: providers
    });
    
    // Apply additional filters
    if (year) {
      results = results.filter(r => r.year === parseInt(year));
    }
    
    if (genre) {
      const genreLower = genre.toLowerCase();
      results = results.filter(r => 
        r.genres?.some(g => g.toLowerCase().includes(genreLower)) ||
        r.genre?.toLowerCase().includes(genreLower)
      );
    }
    
    // Apply limit
    results = results.slice(0, parseInt(limit));
    
    const searchTime = Date.now();
    
    res.status(200).json({
      success: true,
      query: query.trim(),
      filters: { type, year, genre },
      results,
      meta: {
        total: results.length,
        searchTimeMs: searchTime
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
 * GET /api/search/suggestions
 * Get search suggestions based on partial query
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        suggestions: []
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    // Perform quick search
    const results = await pluginEngine.search(q.trim(), {
      limit: 10
    });
    
    // Extract titles for suggestions
    const suggestions = results
      .map(r => r.title)
      .filter(Boolean)
      .slice(0, 10);
    
    res.status(200).json({
      success: true,
      suggestions
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
