import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/sounds
router.get('/sounds', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, color, signature, created_at AS "createdAt" FROM sounds ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/sounds
router.post('/sounds', async (req, res) => {
  try {
    const { name, color, signature } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    const id = Date.now().toString();
    const result = await pool.query(
      'INSERT INTO sounds (id, name, color, signature) VALUES ($1, $2, $3, $4) RETURNING id, name, color, signature, created_at AS "createdAt"',
      [id, name, color, signature ? JSON.stringify(signature) : null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/sounds/:id/signature - Update a sound's audio signature
router.put('/sounds/:id/signature', async (req, res) => {
  try {
    const { id } = req.params;
    const { signature } = req.body;

    if (!signature) {
      return res.status(400).json({ error: 'Signature is required' });
    }

    const result = await pool.query(
      'UPDATE sounds SET signature = $1 WHERE id = $2 RETURNING id, name, color, signature, created_at AS "createdAt"',
      [JSON.stringify(signature), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sound not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sounds/:id
router.delete('/sounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM sounds WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
