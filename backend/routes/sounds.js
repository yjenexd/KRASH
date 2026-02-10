import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const dataDir = path.join(__dirname, '..', 'data');

// Ensure data directory exists
await fs.mkdir(dataDir, { recursive: true });

const soundsFile = path.join(dataDir, 'sounds.json');

// Initialize sounds file if it doesn't exist
async function ensureSoundsFile() {
  try {
    await fs.access(soundsFile);
  } catch {
    await fs.writeFile(soundsFile, JSON.stringify([], null, 2));
  }
}

async function readSounds() {
  await ensureSoundsFile();
  const data = await fs.readFile(soundsFile, 'utf-8');
  return JSON.parse(data);
}

async function writeSounds(sounds) {
  await fs.writeFile(soundsFile, JSON.stringify(sounds, null, 2));
}

// GET /api/sounds
router.get('/sounds', async (req, res) => {
  try {
    const sounds = await readSounds();
    res.json(sounds);
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

    const sounds = await readSounds();
    const newSound = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString(),
      ...(signature ? { signature } : {}),
    };

    sounds.push(newSound);
    await writeSounds(sounds);

    res.status(201).json(newSound);
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

    const sounds = await readSounds();
    const idx = sounds.findIndex(s => s.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Sound not found' });
    }

    sounds[idx].signature = signature;
    await writeSounds(sounds);

    res.json(sounds[idx]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/sounds/:id
router.delete('/sounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sounds = await readSounds();
    const filtered = sounds.filter(s => s.id !== id);
    await writeSounds(filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
