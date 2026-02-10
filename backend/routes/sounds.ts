import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sound } from './sound.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();
const dataDir = path.join(__dirname, 'data');

// Ensure data directory exists
(async () => {
  try {
    await fs.mkdir(dataDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
})();

const soundsFile = path.join(dataDir, 'sounds.json');

// Initialize sounds file if it doesn't exist
async function ensureSoundsFile() {
  try {
    await fs.access(soundsFile);
  } catch {
    await fs.writeFile(soundsFile, JSON.stringify([], null, 2));
  }
}

async function readSounds(): Promise<Sound[]> {
  await ensureSoundsFile();
  const data = await fs.readFile(soundsFile, 'utf-8');
  return JSON.parse(data) as Sound[];
}

async function writeSounds(sounds: Sound[]): Promise<void> {
  await fs.writeFile(soundsFile, JSON.stringify(sounds, null, 2));
}

// GET /api/sounds
router.get('/sounds', async (req, res) => {
  try {
    const sounds = await readSounds();
    res.json(sounds);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// POST /api/sounds
router.post('/sounds', async (req, res) => {
  try {
    const { name, color, bass, middle, treble } = req.body;
    
    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    if (bass == 0 && middle == 0 && treble == 0) {
      return res.status(400).json({ error: 'No Sound Detected' });
    }

    const sounds = await readSounds();
    const newSound = {
      id: Date.now().toString(),
      name,
      color,
      bass,
      middle,
      treble,
      createdAt: new Date().toISOString(),
    };

    sounds.push(newSound);
    await writeSounds(sounds);

    res.status(201).json(newSound);
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// DELETE /api/sounds/:id
router.delete('/sounds/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const sounds = await readSounds();
    const filtered = sounds.filter((s: Sound) => s.id !== id);
    await writeSounds(filtered);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

export default router;
