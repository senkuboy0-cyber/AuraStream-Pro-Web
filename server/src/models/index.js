/**
 * AuraStream Pro Web - Mongoose Models
 * 
 * This module defines the database schemas for:
 * - Repository: Installed provider repositories
 * - User: User accounts and preferences
 * - WatchHistory: Media watch history
 * - Bookmark: Saved favorite content
 * 
 * @module models
 */

import mongoose from 'mongoose';

/**
 * Repository Schema
 * 
 * Stores information about installed provider repositories.
 * Each repository contains multiple streaming providers.
 */
const repositorySchema = new mongoose.Schema({
  // Repository metadata
  name: {
    type: String,
    required: true,
    trim: true
  },
  
  description: {
    type: String,
    default: ''
  },
  
  // GitHub URL for the repo.json file
  url: {
    type: String,
    required: true,
    unique: true
  },
  
  // Repository version
  version: {
    type: String,
    default: '1.0.0'
  },
  
  // Provider count
  providerCount: {
    type: Number,
    default: 0
  },
  
  // List of providers in this repository
  providers: [{
    name: String,
    file: String,
    version: String
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last update check
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // User who installed this repository
  installedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  
  // Installation date
  installedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
repositorySchema.index({ url: 1 });
repositorySchema.index({ isActive: 1 });
repositorySchema.index({ installedBy: 1 });

/**
 * User Schema
 * 
 * Stores user account information and preferences.
 */
const userSchema = new mongoose.Schema({
  // User identity
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    lowercase: true
  },
  
  // Password hash (for future auth implementation)
  passwordHash: {
    type: String,
    default: null
  },
  
  // User preferences
  preferences: {
    defaultPlayerQuality: {
      type: String,
      enum: ['auto', '240p', '360p', '480p', '720p', '1080p', '1440p', '4K'],
      default: 'auto'
    },
    autoplay: {
      type: Boolean,
      default: true
    },
    playbackSpeed: {
      type: Number,
      default: 1.0,
      min: 0.5,
      max: 3.0
    },
    subtitlesEnabled: {
      type: Boolean,
      default: true
    },
    defaultSubtitleLanguage: {
      type: String,
      default: 'en'
    },
    theme: {
      type: String,
      enum: ['dark', 'light', 'auto'],
      default: 'dark'
    }
  },
  
  // Installed repositories
  repositories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Repository'
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Last active timestamp
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

/**
 * WatchHistory Schema
 * 
 * Tracks user's watch history with progress information.
 */
const watchHistorySchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Media information
  mediaId: {
    type: String,
    required: true
  },
  
  mediaTitle: {
    type: String,
    required: true
  },
  
  mediaType: {
    type: String,
    enum: ['movie', 'series', 'anime'],
    default: 'movie'
  },
  
  // Poster/thumbnail URL
  poster: {
    type: String,
    default: null
  },
  
  // Provider source
  source: {
    providerId: String,
    providerName: String
  },
  
  // Progress tracking
  currentEpisode: {
    type: Number,
    default: 1
  },
  
  currentSeason: {
    type: Number,
    default: 1
  },
  
  // Timestamp in seconds
  timestamp: {
    type: Number,
    default: 0
  },
  
  // Duration in seconds
  duration: {
    type: Number,
    default: 0
  },
  
  // Progress percentage
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Completion status
  isCompleted: {
    type: Boolean,
    default: false
  },
  
  // Episode info for series
  episodeInfo: {
    episodeNumber: Number,
    seasonNumber: Number,
    title: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
watchHistorySchema.index({ user: 1, mediaId: 1 });
watchHistorySchema.index({ user: 1, updatedAt: -1 });
watchHistorySchema.index({ user: 1, isCompleted: 1 });

/**
 * Bookmark Schema
 * 
 * Stores user's saved favorite content.
 */
const bookmarkSchema = new mongoose.Schema({
  // User reference
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Media information
  mediaId: {
    type: String,
    required: true
  },
  
  mediaTitle: {
    type: String,
    required: true
  },
  
  mediaType: {
    type: String,
    enum: ['movie', 'series', 'anime'],
    default: 'movie'
  },
  
  // Poster/thumbnail URL
  poster: {
    type: String,
    default: null
  },
  
  // Media metadata
  year: {
    type: Number,
    default: null
  },
  
  rating: {
    type: Number,
    default: null
  },
  
  genres: [String],
  
  // Provider source
  source: {
    providerId: String,
    providerName: String
  },
  
  // User note
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Compound index for unique bookmarks per user
bookmarkSchema.index({ user: 1, mediaId: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });

// Create and export models
const Repository = mongoose.models.Repository || mongoose.model('Repository', repositorySchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);
const WatchHistory = mongoose.models.WatchHistory || mongoose.model('WatchHistory', watchHistorySchema);
const Bookmark = mongoose.models.Bookmark || mongoose.model('Bookmark', bookmarkSchema);

export { Repository, User, WatchHistory, Bookmark };
export default { Repository, User, WatchHistory, Bookmark };
