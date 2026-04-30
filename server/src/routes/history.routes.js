/**
 * Watch History Routes
 * 
 * Handles watch history operations:
 * - Add/update watch progress
 * - Get continue watching list
 * - Mark as completed
 * - Clear history
 */

import { Router } from 'express';
import { WatchHistory } from '../models/index.js';

const router = Router();

/**
 * GET /api/history/:userId
 * Get user's watch history
 */
router.get('/:userId', async (req, res) => {
  try {
    const { limit = 50, skip = 0, completed } = req.query;
    
    const query = { user: req.params.userId };
    
    if (completed !== undefined) {
      query.isCompleted = completed === 'true';
    }
    
    const history = await WatchHistory.find(query)
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await WatchHistory.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: parseInt(skip) + history.length < total
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
 * GET /api/history/:userId/continue
 * Get continue watching list (incomplete items sorted by progress)
 */
router.get('/:userId/continue', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    const continueWatching = await WatchHistory.find({
      user: req.params.userId,
      isCompleted: false,
      progress: { $gt: 0, $lt: 100 }
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: continueWatching
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/history
 * Add or update watch progress
 */
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      mediaId,
      mediaTitle,
      mediaType = 'movie',
      poster,
      timestamp,
      duration,
      providerId,
      providerName,
      episodeInfo
    } = req.body;
    
    if (!userId || !mediaId) {
      return res.status(400).json({
        success: false,
        error: 'User ID and Media ID are required'
      });
    }
    
    // Calculate progress percentage
    const progress = duration > 0 
      ? Math.min(100, Math.round((timestamp / duration) * 100))
      : 0;
    
    // Check if record exists
    const existing = await WatchHistory.findOne({
      user: userId,
      mediaId,
      ...(episodeInfo && {
        'episodeInfo.episodeNumber': episodeInfo.episodeNumber,
        'episodeInfo.seasonNumber': episodeInfo.seasonNumber
      })
    });
    
    let history;
    
    if (existing) {
      // Update existing record
      existing.timestamp = timestamp;
      existing.duration = duration || existing.duration;
      existing.progress = progress;
      existing.isCompleted = progress >= 95;
      existing.currentEpisode = episodeInfo?.episodeNumber || existing.currentEpisode;
      existing.currentSeason = episodeInfo?.seasonNumber || existing.currentSeason;
      existing.episodeInfo = episodeInfo || existing.episodeInfo;
      
      history = await existing.save();
    } else {
      // Create new record
      history = new WatchHistory({
        user: userId,
        mediaId,
        mediaTitle,
        mediaType,
        poster,
        timestamp,
        duration,
        progress,
        isCompleted: progress >= 95,
        currentEpisode: episodeInfo?.episodeNumber || 1,
        currentSeason: episodeInfo?.seasonNumber || 1,
        episodeInfo,
        source: { providerId, providerName }
      });
      
      await history.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Watch progress saved',
      data: history
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/history/:historyId
 * Remove a history entry
 */
router.delete('/:historyId', async (req, res) => {
  try {
    const history = await WatchHistory.findByIdAndDelete(req.params.historyId);
    
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'History entry removed'
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/history/user/:userId
 * Clear all watch history for a user
 */
router.delete('/user/:userId', async (req, res) => {
  try {
    const result = await WatchHistory.deleteMany({
      user: req.params.userId
    });
    
    res.status(200).json({
      success: true,
      message: 'Watch history cleared',
      deletedCount: result.deletedCount
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/history/:historyId/complete
 * Mark a history entry as completed
 */
router.post('/:historyId/complete', async (req, res) => {
  try {
    const history = await WatchHistory.findByIdAndUpdate(
      req.params.historyId,
      { $set: { isCompleted: true, progress: 100 } },
      { new: true }
    );
    
    if (!history) {
      return res.status(404).json({
        success: false,
        error: 'History entry not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Marked as completed',
      data: history
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
