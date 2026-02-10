# SonicSight

An accessibility app that visualises sound for deaf and hard-of-hearing users. Calibrate real-world sounds, detect them in real time via your device's microphone, and see colour-coded visual feedback.

## Tech Stack

- **Frontend** — React 19 · TypeScript · Vite
- **Backend** — Express.js (Node 20+)
- **Detection** — MFCC feature extraction + DTW matching (all client-side)

## Local Development

```bash
# 1. Install everything
cd frontend && npm install
cd ../backend && npm install

# 2. Start backend (port 5001)
cd backend && node server.js

# 3. Start frontend (port 5173) — in another terminal
cd frontend && npm run dev
```

## Deploy to Render

1. Push to GitHub
2. On [Render](https://render.com), create a **New Web Service** and connect the repo
3. Set:
   - **Build Command:** `cd frontend && npm install && npm run build && cd ../backend && npm install`
   - **Start Command:** `cd backend && node server.js`
4. Done — the backend serves the frontend build and the API from the same origin

Or click **New Blueprint** and select this repo — Render will read `render.yaml` automatically.

## Project Structure

```
├── frontend/          React + Vite SPA
│   └── src/
│       ├── pages/     Visualizer, CalibrateSound, SoundLibrary, History, Settings
│       ├── hooks/     useSounds, useDetections, useSettings, useSoundDetection, useAudioRecorder
│       ├── utils/     audioSignature (MFCC/DTW), audioUtils, dateUtils
│       └── lib/       api.ts (shared fetch wrapper)
├── backend/           Express API
│   ├── server.js      Entry — serves API + static frontend
│   └── routes/        sounds, detections, settings, audio
└── render.yaml        Render deployment blueprint
```