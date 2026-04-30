/**
 * AuraStream Pro Web - MONOLITHIC SERVER
 * 
 * This single server handles:
 * 1. Express API for Plugin/Scraping logic
 * 2. Next. js for UI rendering
 * 3. Static file serving
 * 
 * @version 1.0.0
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';

// Load environment variables
dotenv.config();

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Logger Setup
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston. format.timestamp(),
    winston.format.errors({ stack: true }),
    winston. format.json()
  ),
  transports: [
    new winston. transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => `[AuraStream] ${message}`)
      )
    })
  ]
});

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;


// ===================== SECURITY MIDDLEWARE =====================
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https:", "wss:"],
      frameSrc: ["'self'", "https:"]
    }
  }
}));


app.use(cors({
  origin: true, // Allow all origins in same-domain deployment
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests' }
}));


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined'));

// ===================== STATIC FILES =====================
// Serve Next. js build files
const clientBuildPath = path.join(__dirname, 'client', '.next', 'standalone');
app.use(express.static(path.join(clientBuildPath, 'static')));
app.use('/_next', express.static(path.join(clientBuildPath, 'server'));

// ===================== API ROUTES =====================


// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'AuraStream Pro',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Repository Management
app.get('/api/repositories', (req, res) => {
  // Mock data - in production, load from MongoDB
  res.json({
    success: true,
    data: [],
    count: 0
  });
});

app.post('/api/repositories', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL required' });
  }
  
  // Fetch repo. json
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const data = await response.json();
    
    res.json({
      success: true,
      message: 'Repository added',
      data: {
        name: data.name,
        url,
        version: data.version,
        providerCount: data.providers?.length || 0
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Search across providers
app.get('/api/search', async (req, res) => {
  const { q, type } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(400).json({ success: false, error: 'Query too short' });
  }
  
  // Mock search results - implement real plugin engine here
  const mockResults = [
    { id: '1', title: 'Sample Movie', type: 'movie', poster: 'https://picsum.photos/seed/movie/300/450', year: 2024, rating: 8.5 },
    { id: '2', title: 'Sample Series', type: 'series', poster: 'https://picsum.photos/seed/series/300/450', year: 2024, rating: 9.0 },
    { id: '3', title: 'Sample Anime', type: 'anime', poster: 'https://picsum.photos/seed/anime/300/450', year: 2024, rating: 8.8 }
  ].filter(item => item.title.toLowerCase().includes(q.toLowerCase()));
  
  res.json({
    success: true,
    query: q,
    results: mockResults,
    meta: { total: mockResults.length, searchTimeMs: 50 }
  });
});

// Stream proxy (CORS bypass)
app.post('/api/stream/manifest', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ success: false, error: 'URL required' });
  }
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': '*/*'
      }
    });
    const text = await response.text();
    
    res.json({
      success: true,
      content: text,
      url
    });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

// ===================== MONGOOSE CONNECTION =====================

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    logger.warn('MONGODB_URI not set - running without database');
    return;
  }
  
  try {
    await mongoose.connect(mongoUri);
    logger.info('MongoDB connected');
    
    mongoose.connection.on('error', (err) => logger.error('MongoDB Error:', err));
    mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
  } catch (error) {
    logger.error('MongoDB connection failed:', error);
  }
};


// ===================== CATCH-ALL FOR NEXT.JS =====================
// Handle Next. js pages
app.get('*', async (req, res, next) => {
  try {
    // Import Next on demand
    const nextjs = (await import('next')).default;
    
    const nextApp = nextjs({ 
      dev: process.env.NODE_ENV === 'development',
      dir: __dirname,
      quiet: true,
      conf: {
        output: 'standalone',
        target: 'server'
      }
    });
    
    await nextApp.prepare();
    
    const handle = nextApp.getRequestHandler();
    await handle(req, res);
  } catch (error) {
    next(error);
  }
});

// Error Handler
app.use((err, req, res, next) => {
  logger.error('Server Error:', err);
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal error' : err.message
  });
});

// ===================== SERVER START =====================
async function startServer() {
  await connectDB();
  
  const server = createServer(app);
  
  server.listen(PORT, () => {
    logger.info(`\n==================================`);
    logger.info(`🚀 AuraStream Pro Server`);
    logger.info(`   URL: http://localhost:${PORT}`);
    logger.info(`   Mode: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`==================================\n`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
