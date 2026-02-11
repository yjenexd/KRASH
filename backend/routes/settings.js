import express from 'express';
import pool from '../db.js';

const router = express.Router();

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT value FROM settings WHERE key = 'app_settings'"
    );
    res.json(result.rows[0]?.value ?? {
      sensitivity: 50,
      hapticSync: true,
      notifications: true,
      soundAlerts: false,
      darkMode: true,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings
router.put('/settings', async (req, res) => {
  try {
    // Merge with existing settings
    const existing = await pool.query(
      "SELECT value FROM settings WHERE key = 'app_settings'"
    );
    const current = existing.rows[0]?.value ?? {};
    const updated = { ...current, ...req.body };

    await pool.query(
      "INSERT INTO settings (key, value) VALUES ('app_settings', $1) ON CONFLICT (key) DO UPDATE SET value = $1",
      [JSON.stringify(updated)]
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
