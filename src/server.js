/**
 * AuraStream Pro Web - MONOLITHIC SERVER
 * Single server for API + UI
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message }) => `[AuraStream] ${message}`)
      )
    })
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Security
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

app.use(cors({ origin: true, credentials: true }));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'AuraStream Pro',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/search', async (req, res) => {
  const { q } = req.query;
  if (!q || q.length < 2) {
    return res.status(400).json({ success: false, error: 'Query too short' });
  }
  
  const mockResults = [
    { id: '1', title: 'Sample Movie', type: 'movie', poster: 'https://picsum.photos/seed/1/300/450', year: 2024, rating: 8.5 },
    { id: '2', title: 'Sample Series', type: 'series', poster: 'https://picsum.photos/seed/2/300/450', year: 2024, rating: 9.0 },
    { id: '3', title: 'Sample Anime', type: 'anime', poster: 'https://picsum.photos/seed/3/300/450', year: 2024, rating: 8.8 }
  ].filter(item => item.title.toLowerCase().includes(q.toLowerCase()));
  
  res.json({ success: true, query: q, results: mockResults, meta: { total: mockResults.length } });
});

app.get('/api/repositories', (req, res) => {
  res.json({ success: true, data: [], count: 0 });
});

app.post('/api/repositories', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL required' });
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url);
    const data = await response.json();
    res.json({
      success: true,
      message: 'Repository added',
      data: { name: data.name, url, version: data.version, providerCount: data.providers?.length || 0 }
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/api/stream/manifest', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ success: false, error: 'URL required' });
  
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': '*/*' }
    });
    const text = await response.text();
    res.json({ success: true, content: text, url });
  } catch (error) {
    res.status(502).json({ success: false, error: error.message });
  }
});

// Static files from Next.js build
const clientOut = path.join(__dirname, 'client', '.next', 'standalone');
app.use('/_next/static', express.static(path.join(clientOut, 'static')));
app.use('/_next', express.static(path.join(clientOut, 'server')));

// Serve Next.js app
app.get('*', async (req, res) => {
  try {
    const Next = (await import('next')).default;
    const nextApp = Next({ dev: false, dir: __dirname, quiet: true });
    await nextApp.prepare();
    const handle = nextApp.getRequestHandler();
    await handle(req, res);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// Error
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal error' });
});

// Start
const server = createServer(app);
server.listen(PORT, () => {
  logger.info(`\n==================================`);
  logger.info(`AuraStream Pro Server Running`);
  logger.info(`URL: http://localhost:${PORT}`);
  logger.info(`Mode: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`==================================\n`);
});

process.on('SIGTERM', () => { process.exit(0); });
process.on('SIGINT', () => { process.exit(0); });
