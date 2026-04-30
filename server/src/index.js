/**
 * AuraStream Pro Web - Updated Server Entry Point
 * 
 * This is the updated main entry point that uses the router-based approach.
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

// Configure Winston logger
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

// Global services
const pluginEngine = new PluginEngine(logger);
const streamResolver = new StreamResolver(logger);

// Middleware
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

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  maxAge: 86400
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('combined', {
  stream: { write: (message) => logger.http(message.trim()) }
}));

// Attach services to app.locals for access in routes
app.locals.pluginEngine = pluginEngine;
app.locals.streamResolver = streamResolver;
app.locals.logger = logger;
app.locals.mongoose = mongoose;

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/repositories', repositoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/stream', streamRoutes);
app.use('/api/users', userRoutes);
app.use('/api/history', historyRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method
  });
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Unhandled error:', { error: err.message, stack: err.stack });
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Initialize Plugin Engine
async function initializePluginEngine() {
  try {
    logger.info('Initializing Plugin Engine...');
    await pluginEngine.initialize();
    logger.info(`Plugin Engine initialized with ${pluginEngine.getProviderCount()} providers`);
  } catch (error) {
    logger.error('Failed to initialize Plugin Engine:', error);
  }
}

// Connect to MongoDB
async function connectToDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/aurastream';
  
  try {
    logger.info('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    logger.info('MongoDB connected successfully');
    
    mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
    mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));
    
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
    if (process.env.NODE_ENV === 'development') {
      logger.warn('Running in development mode without database');
    }
  }
}

// Server Startup
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    await connectToDatabase();
    await initializePluginEngine();
    
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

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;

startServer();
