import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const audioDir = path.join(__dirname, '../data/audio');

// Ensure audio directory exists
await fs.mkdir(audioDir, { recursive: true });

// POST /api/audio - Save audio file (base64)
router.post('/audio', async (req, res) => {
  try {
    const { audioData, fileName } = req.body;
    
    if (!audioData) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Convert base64 to buffer
    const base64Data = audioData.replace(/^data:audio\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Create filename
    const uniqueFileName = `${Date.now()}-${fileName || 'recording.wav'}`;
    const filePath = path.join(audioDir, uniqueFileName);
    
    // Write file
    await fs.writeFile(filePath, buffer);
    
    res.status(201).json({
      id: Date.now().toString(),
      fileName: uniqueFileName,
      url: `/api/audio/${uniqueFileName}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/audio/:fileName - Retrieve audio file
router.get('/audio/:fileName', async (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = path.join(audioDir, fileName);
    
    const data = await fs.readFile(filePath);
    res.set('Content-Type', 'audio/wav');
    res.send(data);
  } catch (error) {
    res.status(404).json({ error: 'Audio file not found' });
  }
});

export default router;
