/**
 * Stream Resolution Routes
 * 
 * Handles streaming proxy and resolution.
 * Bypasses CORS and User-Agent restrictions from streaming sites.
 */

import { Router } from 'express';

const router = Router();

/**
 * GET /api/stream/proxy
 * Proxy a streaming request with custom headers
 * 
 * Query Parameters:
 *   url: string - Target streaming URL
 */
router.get('/proxy', async (req, res) => {
  try {
    const { url } = req.query;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL parameter is required'
      });
    }
    
    const streamResolver = req.services?.streamResolver;
    
    if (!streamResolver) {
      return res.status(500).json({
        success: false,
        error: 'Stream resolver not available'
      });
    }
    
    const result = await streamResolver.fetch(url);
    
    res.status(result.success ? 200 : 502).json(result);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stream/manifest
 * Get HLS manifest and available streams
 * 
 * Body:
 *   url: string - Master playlist URL
 */
router.post('/manifest', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const streamResolver = req.services?.streamResolver;
    
    if (!streamResolver) {
      return res.status(500).json({
        success: false,
        error: 'Stream resolver not available'
      });
    }
    
    const manifest = await streamResolver.getHLSManifest(url);
    
    res.status(manifest.success ? 200 : 502).json(manifest);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stream/quality
 * Get a specific quality stream URL
 * 
 * Body:
 *   url: string - Master playlist URL
 *   quality: number - Target video height (e.g., 720)
 */
router.post('/quality', async (req, res) => {
  try {
    const { url, quality = 720 } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }
    
    const streamResolver = req.services?.streamResolver;
    
    if (!streamResolver) {
      return res.status(500).json({
        success: false,
        error: 'Stream resolver not available'
      });
    }
    
    const streamUrl = await streamResolver.getQualityStream(url, parseInt(quality));
    
    if (!streamUrl) {
      return res.status(404).json({
        success: false,
        error: 'No suitable stream found'
      });
    }
    
    res.status(200).json({
      success: true,
      url: streamUrl,
      quality: quality
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stream/sources
 * Get streaming sources for a media item
 * 
 * Body:
 *   providerId: string - Provider ID
 *   mediaId: object - Media identifier
 *   episodeInfo: object - Episode info for series
 */
router.post('/sources', async (req, res) => {
  try {
    const { providerId, mediaId, episodeInfo } = req.body;
    
    if (!providerId || !mediaId) {
      return res.status(400).json({
        success: false,
        error: 'Provider ID and Media ID are required'
      });
    }
    
    const pluginEngine = req.services?.pluginEngine;
    
    if (!pluginEngine) {
      return res.status(500).json({
        success: false,
        error: 'Plugin engine not available'
      });
    }
    
    const sources = await pluginEngine.getSources(providerId, mediaId, episodeInfo);
    
    res.status(200).json({
      success: true,
      ...sources
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/stream/subtitle
 * Fetch and convert subtitle
 * 
 * Body:
 *   url: string - Subtitle URL
 *   format: string - Target format (vtt, srt)
 */
router.post('/subtitle', async (req, res) => {
  try {
    const { url, format = 'vtt' } = req.body;
    
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'Subtitle URL is required'
      });
    }
    
    const streamResolver = req.services?.streamResolver;
    
    if (!streamResolver) {
      return res.status(500).json({
        success: false,
        error: 'Stream resolver not available'
      });
    }
    
    const subtitle = await streamResolver.getSubtitle(url, format);
    
    res.status(subtitle.success ? 200 : 502).json(subtitle);
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
