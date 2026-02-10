# SonicSight - 8 Hour MVP Vertical Slice Breakdown

## Architecture Overview
- **Frontend**: React (already built, needs API integration)
- **Backend**: Express.js (file-based, no database)
- **Integration**: Each person implements their own API endpoints + frontend hooks

---

## Vertical Slices (4 Independent Tracks)

### **PERSON 1: Sound Library Slice** ⏱️ 2 hours
**Feature**: Browse, add, and delete calibrated sounds

**Backend Tasks** (45 min):
- Create `/backend/routes/sounds.js`
- Implement endpoints:
  - `GET /api/sounds` - List all sounds
  - `POST /api/sounds` - Add new sound
  - `DELETE /api/sounds/:id` - Delete sound
- Create `/backend/data/sounds.json` for storage

**Frontend Tasks** (45 min):
- Create `/frontend/src/hooks/useSounds.ts` (fetch, add, delete hooks)
- Wire up `SoundLibrary.tsx` page to API
- Add loading/error states

**Testing** (30 min):
- Test full workflow: View → Add → Delete sounds

---

### **PERSON 2: Detection History Slice** ⏱️ 2 hours
**Feature**: View timestamped sound detections

**Backend Tasks** (45 min):
- Create `/backend/routes/detections.js`
- Implement endpoints:
  - `GET /api/detections` - List all detections
  - `POST /api/detections` - Log a detection
- Create `/backend/data/detections.json` for storage

**Frontend Tasks** (45 min):
- Create `/frontend/src/hooks/useDetections.ts` (fetch, create hooks)
- Wire up `History.tsx` page to API
- Add real-time detection logging

**Testing** (30 min):
- Test logging detections and viewing history

---

### **PERSON 3: Settings Slice** ⏱️ 2 hours
**Feature**: Manage user preferences

**Backend Tasks** (45 min):
- Create `/backend/routes/settings.js`
- Implement endpoints:
  - `GET /api/settings` - Get user settings
  - `PUT /api/settings` - Update settings
- Create `/backend/data/settings.json` for storage

**Frontend Tasks** (45 min):
- Create `/frontend/src/hooks/useSettings.ts` (fetch, update hooks)
- Wire up `Settings.tsx` page to API
- Persist settings to localStorage

**Testing** (30 min):
- Test toggling settings and persistence

---

### **PERSON 4: Audio Recording & Calibration Slice** ⏱️ 2 hours
**Feature**: Record audio, label it, assign color, save sound

**Backend Tasks** (30 min):
- Create `/backend/routes/audio.js`
- Implement endpoint:
  - `POST /api/audio` - Save audio file (base64)

**Frontend Tasks** (1 hour):
- Create `/frontend/src/hooks/useAudioRecorder.ts` (Web Audio API integration)
- Create `/frontend/src/utils/audioUtils.ts` (waveform, recording logic)
- Wire up `CalibrateSound.tsx` to recording + API

**Testing** (30 min):
- Test recording → labeling → saving workflow

---

## File Structure to Create

```
backend/
├── package.json
├── server.js
├── routes/
│   ├── sounds.js
│   ├── detections.js
│   ├── settings.js
│   └── audio.js
└── data/
    ├── sounds.json
    ├── detections.json
    ├── settings.json
    └── audio/

frontend/src/
├── hooks/
│   ├── useSounds.ts
│   ├── useDetections.ts
│   ├── useSettings.ts
│   ├── useAudioRecorder.ts
│   └── useAPI.ts (shared)
└── utils/
    └── audioUtils.ts
```

---

## Integration Points (When Merging)

1. All endpoints run on same server (port 5000)
2. Frontend `.env` points to `http://localhost:5000`
3. Each person's hooks are independent - no conflicts
4. Each page is isolated - no shared state conflicts

---

## Branch Strategy

```bash
# Each person creates their own branch
git checkout -b feature/person1-sound-library
git checkout -b feature/person2-detection-history
git checkout -b feature/person3-settings
git checkout -b feature/person4-audio-recording

# Merge when done (should have zero conflicts)
git checkout main
git merge feature/person1-sound-library
git merge feature/person2-detection-history
git merge feature/person3-settings
git merge feature/person4-audio-recording
```

---

## Success Criteria for Each Slice

✅ Backend endpoints working (test with Postman/curl)
✅ Frontend hooks created and typed
✅ Page fully wired to API
✅ Can perform complete workflow (add → view → edit/delete)
✅ Error handling for network failures
✅ Loading states visible to user

---

## Merge Checklist

Before merging each PR:
- [ ] Backend endpoints tested
- [ ] Frontend page tested in isolation
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] API response matches expected format
