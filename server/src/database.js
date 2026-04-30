/**
 * MongoDB Database Connection Configuration
 * 
 * This module handles MongoDB connection setup and provides
 * connection state management for the AuraStream application.
 * 
 * @module database
 */

import mongoose from 'mongoose';

/**
 * MongoDB Connection URI
 * Supports both local MongoDB and MongoDB Atlas
 */
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurastream';

/**
 * MongoDB Connection Options
 * Configured for production-ready connection handling
 */
const connectionOptions = {
  maxPoolSize: 10,                     // Maximum number of connections in the pool
  minPoolSize: 2,                      // Minimum number of connections in the pool
  serverSelectionTimeoutMS: 5000,       // Timeout for server selection
  socketTimeoutMS: 45000,               // Socket timeout in milliseconds
  family: 4,                           // Use IPv4
  retryWrites: true,                    // Retry writes on transient errors
  w: 'majority',                       // Write concern
};

/**
 * Connect to MongoDB
 * Establishes a connection to the MongoDB database
 * 
 * @returns {Promise<mongoose.Connection>} Mongoose connection object
 * @throws {Error} If connection fails
 */
export async function connectDatabase() {
  try {
    // Remove credentials from log output for security
    const safeUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//<credentials>@');
    
    console.log(`[Database] Connecting to MongoDB: ${safeUri}`);
    
    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    console.log('[Database] ✅ MongoDB connected successfully');
    
    // Set up connection event handlers
    mongoose.connection.on('error', (error) => {
      console.error('[Database] ❌ MongoDB connection error:', error);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] ⚠️ MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('[Database] ✅ MongoDB reconnected');
    });
    
    return mongoose.connection;
    
  } catch (error) {
    console.error('[Database] ❌ Failed to connect to MongoDB:', error.message);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * Gracefully closes the database connection
 * 
 * @returns {Promise<void>}
 */
export async function disconnectDatabase() {
  try {
    await mongoose.connection.close();
    console.log('[Database] ✅ MongoDB disconnected gracefully');
  } catch (error) {
    console.error('[Database] ❌ Error disconnecting from MongoDB:', error.message);
    throw error;
  }
}

/**
 * Check Database Connection State
 * 
 * @returns {boolean} True if connected, false otherwise
 */
export function isConnected() {
  return mongoose.connection.readyState === 1;
}

/**
 * Get Database Instance
 * 
 * @returns {mongoose.Connection} Mongoose connection instance
 */
export function getDatabase() {
  return mongoose.connection;
}

export default {
  connectDatabase,
  disconnectDatabase,
  isConnected,
  getDatabase
};
