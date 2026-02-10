import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const dataDir = path.join(__dirname, '../data');

// Ensure data directory exists
await fs.mkdir(dataDir, { recursive: true });

const settingsFile = path.join(dataDir, 'settings.json');

const defaultSettings = {
  sensitivity: 50,
  hapticSync: true,
  notifications: true,
  soundAlerts: false,
  darkMode: true,
};

// Initialize settings file if it doesn't exist
async function ensureSettingsFile() {
  try {
    await fs.access(settingsFile);
  } catch {
    await fs.writeFile(settingsFile, JSON.stringify(defaultSettings, null, 2));
  }
}

async function readSettings() {
  await ensureSettingsFile();
  const data = await fs.readFile(settingsFile, 'utf-8');
  return JSON.parse(data);
}

async function writeSettings(settings) {
  await fs.writeFile(settingsFile, JSON.stringify(settings, null, 2));
}

// GET /api/settings
router.get('/settings', async (req, res) => {
  try {
    const settings = await readSettings();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/settings
router.put('/settings', async (req, res) => {
  try {
    const settings = await readSettings();
    const updated = { ...settings, ...req.body };
    await writeSettings(updated);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
