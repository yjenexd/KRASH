import express from 'express';
import pool from '../db.js';

const router = express.Router();

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

    const id = Date.now().toString();
    const uniqueFileName = `${id}-${fileName || 'recording.wav'}`;

    await pool.query(
      'INSERT INTO audio_files (id, file_name, data) VALUES ($1, $2, $3)',
      [id, uniqueFileName, buffer]
    );

    res.status(201).json({
      id,
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
    const result = await pool.query(
      'SELECT data FROM audio_files WHERE file_name = $1',
      [fileName]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Audio file not found' });
    }

    res.set('Content-Type', 'audio/wav');
    res.send(result.rows[0].data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
