/**
 * AuraStream Pro Web - Main Server
 */
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      mediaSrc: ["'self'", "https:", "blob:"],
      connectSrc: ["'self'", "https:"]
    }
  }
}));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('combined'));

// Serve static files
app.use('/_next/static', express.static(path.join(__dirname, 'client', '.next', 'static')));
app.use('/_next', express.static(path.join(__dirname, 'client', '.next')));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'healthy', service: 'AuraStream Pro', version: '1.0.0' });
});

app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, results: [] });
  const results = [
    { id: '1', title: 'Action Movie', type: 'movie', poster: 'https://picsum.photos/seed/1/300/450', year: 2024, rating: 8.5 },
    { id: '2', title: 'Drama Series', type: 'series', poster: 'https://picsum.photos/seed/2/300/450', year: 2024, rating: 9.0 }
  ];
  res.json({ success: true, results: results.filter(r => r.title.toLowerCase().includes(String(q).toLowerCase())) });
});

app.get('/api/repositories', (req, res) => {
  res.json({ success: true, data: [], count: 0 });
});

// Serve Next.js
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

const server = createServer(app);
server.listen(PORT, () => {
  console.log(`\n🚀 AuraStream Pro Server\n   URL: http://localhost:${PORT}\n   Mode: ${process.env.NODE_ENV || 'development'}\n`);
});

process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
