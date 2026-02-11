import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { initDB } from './db.js';

// Import route handlers
import soundsRouter from './routes/sounds.js';
import detectionsRouter from './routes/detections.js';
import settingsRouter from './routes/settings.js';
import audioRouter from './routes/audio.js';

const app = express();
const PORT = process.env.PORT || 5001;

// CORS — allow the frontend origin (set via env var in production)
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// API Routes
app.use('/api', soundsRouter);
app.use('/api', detectionsRouter);
app.use('/api', settingsRouter);
app.use('/api', audioRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize database then start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 SonicSight API running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err);
    process.exit(1);
  });
