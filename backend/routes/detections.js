import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/detections
router.get('/detections', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, color, timestamp FROM detections ORDER BY timestamp DESC'
    );
    res.json(result.rows);
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

    const id = Date.now().toString();
    const name = `${soundName} detected`;
    const color = soundColor || '#3b82f6';

    const result = await pool.query(
      'INSERT INTO detections (id, name, color) VALUES ($1, $2, $3) RETURNING id, name, color, timestamp',
      [id, name, color]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
