/**
 * User Management Routes
 * 
 * Handles user account operations:
 * - Profile management
 * - Preferences
 * - Repository associations
 */

import { Router } from 'express';
import { User } from '../models/index.js';

const router = Router();

/**
 * GET /api/users/:id
 * Get user profile
 */
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:id
 * Update user profile or preferences
 */
router.put('/:id', async (req, res) => {
  try {
    const { preferences, username } = req.body;
    const updates = {};
    
    if (preferences) {
      updates.preferences = preferences;
    }
    
    if (username) {
      updates.username = username;
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-passwordHash');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/users
 * Create a new user
 */
router.post('/', async (req, res) => {
  try {
    const { username, email } = req.body;
    
    if (!username) {
      return res.status(400).json({
        success: false,
        error: 'Username is required'
      });
    }
    
    const user = new User({
      username,
      email,
      lastActive: new Date()
    });
    
    await user.save();
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id/preferences
 * Get user preferences
 */
router.get('/:id/preferences', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.preferences
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/users/:id/preferences
 * Update user preferences
 */
router.put('/:id/preferences', async (req, res) => {
  try {
    const preferences = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { preferences } },
      { new: true, runValidators: true }
    ).select('preferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Preferences updated',
      data: user.preferences
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/users/:id/repositories
 * Get user's installed repositories
 */
router.get('/:id/repositories', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('repositories');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: user.repositories
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
