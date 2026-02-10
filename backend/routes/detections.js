import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
await fs.mkdir(dataDir, { recursive: true });

const detectionsFile = path.join(dataDir, 'detections.json');

// Initialize detections file if it doesn't exist
async function ensureDetectionsFile() {
  try {
    await fs.access(detectionsFile);
  } catch {
    await fs.writeFile(detectionsFile, JSON.stringify([], null, 2));
  }
}

async function readDetections() {
  await ensureDetectionsFile();
  const data = await fs.readFile(detectionsFile, 'utf-8');
  return JSON.parse(data);
}

async function writeDetections(detections) {
  await fs.writeFile(detectionsFile, JSON.stringify(detections, null, 2));
}

// GET /api/detections
router.get('/detections', async (req, res) => {
  try {
    const detections = await readDetections();
    res.json(detections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/detections
router.post('/detections', async (req, res) => {
  try {
    const { soundName, soundColor } = req.body;
    
    if (!soundName) {
      return res.status(400).json({ error: 'Sound name is required' });
    }

    const detections = await readDetections();
    const newDetection = {
      id: Date.now().toString(),
      name: `${soundName} detected`,
      color: soundColor || '#3b82f6',
      timestamp: new Date().toISOString(),
    };

    detections.unshift(newDetection); // Add to front
    await writeDetections(detections);

    res.status(201).json(newDetection);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
