/**
 * AuraStream Pro Web - Main Server Entry Point
 * 
 * This is the main entry point for the AuraStream backend server.
 * It initializes Express, connects to MongoDB, and sets up all middleware and routes.
 * 
 * @author AuraStream Team
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import winston from 'winston';

// Import route handlers
import healthRoutes from './routes/health.routes.js';
import providerRoutes from './routes/provider.routes.js';
import searchRoutes from './routes/search.routes.js';
import streamRoutes from './routes/stream.routes.js';
import repositoryRoutes from './routes/repository.routes.js';
import userRoutes from './routes/user.routes.js';
import historyRoutes from './routes/history.routes.js';

// Import services
import { PluginEngine } from './plugins/PluginEngine.js';
import { StreamResolver } from './services/StreamResolver.js';

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configure Winston logger for structured logging
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'aurastream-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...metadata }) => {
          let msg = `${timestamp} [${level}]: ${message}`;
          if (Object.keys(metadata).length > 0 && metadata.service !== 'aurastream-api') {
            msg += ` ${JSON.stringify(metadata)}`;
          }
          return msg;
        })
      )
    })
  ]
});

// Make logger available globally for services
app.locals.logger = logger;

// Global plugin engine instance
const pluginEngine = new PluginEngine(logger);
const streamResolver = new StreamResolver(logger);

// Make services available to routes
app.locals.pluginEngine = pluginEngine;
app.locals.streamResolver = streamResolver;

/**
 * Security Middleware Configuration
 */

// Helmet for secure HTTP headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https:"]
    }
  }
}));

// CORS configuration for cross-origin requests
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

// Rate limiting to prevent abuse
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.round((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 1000)
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip + (req.user?.id || '')
});

app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));

/**
 * API Routes Configuration
 */

// Health check endpoint
app.use('/api/health', healthRoutes);

// Repository management routes
app.use('/api/repositories', repositoryRoutes);

// Provider management routes
app.use('/api/providers', providerRoutes);

// Search functionality routes
app.use('/api/search', searchRoutes);

// Streaming proxy routes
app.use('/api/stream', streamRoutes);

// User management routes
app.use('/api/users', userRoutes);

// Watch history routes
app.use('/api/history', historyRoutes);

/**
 * Initialize Plugin Engine on Startup
 * Loads all installed providers from the database
 */
async function initializePluginEngine() {
  try {
    logger.info('Initializing Plugin Engine...');
    await pluginEngine.initialize();
    logger.info(`Plugin Engine initialized with ${pluginEngine.getProviderCount()} providers`);
  } catch (error) {
    logger.error('Failed to initialize Plugin Engine:', error);
  }
}

/**
 * MongoDB Connection Configuration
 */
async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurastream';
  
  try {
    logger.info('Connecting to MongoDB...', { uri: mongoUri.replace(/\/\/.*@/, '//<credentials>@') });
    
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    logger.info('MongoDB connected successfully');
    
    // Handle MongoDB events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    // Continue running without database for development
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Running in development mode without database');
    } else {
      process.exit(1);
    }
  }
}

/**
 * 404 Handler
 */
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

/**
 * Global Error Handler
 */
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

/**
 * Server Startup
 */
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to database first
    await connectToDatabase();
    
    // Initialize plugin engine
    await initializePluginEngine();
    
    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 AuraStream API Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`API Documentation: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Export app for testing
export default app;

// Start the server
startServer();
