import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Import route handlers
import soundsRouter from './routes/sounds.js';
import detectionsRouter from './routes/detections.js';
import settingsRouter from './routes/settings.js';
import audioRouter from './routes/audio.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api', soundsRouter);
app.use('/api', detectionsRouter);
app.use('/api', settingsRouter);
app.use('/api', audioRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SonicSight API running on http://localhost:${PORT}`);
  console.log(`📝 Endpoints available at http://localhost:${PORT}/api`);
});
