# Team Setup & Quick Start Guide

## Initial Setup (Everyone - 5 min)

1. **Clone and navigate:**
   ```bash
   cd /Users/jadonkohyujun/Desktop/repos/KRASH
   ```

2. **Create your feature branch** (use your person number):
   ```bash
   # Person 1
   git checkout -b feature/person1-sound-library
   
   # Person 2
   git checkout -b feature/person2-detection-history
   
   # Person 3
   git checkout -b feature/person3-settings
   
   # Person 4
   git checkout -b feature/person4-audio-recording
   ```

3. **Install backend dependencies** (one person does this, others use same backend):
   ```bash
   cd backend
   npm install
   npm run dev  # Starts on http://localhost:5000
   ```

4. **Install frontend dependencies** (if not already done):
   ```bash
   cd frontend
   npm install
   npm run dev  # Starts on http://localhost:5174
   ```

---

## Your Task Assignment

| Person | Task File | Backend Time | Frontend Time | Key Files |
|--------|-----------|--------------|---------------|-----------|
| 1 | TASK_1_SOUND_LIBRARY.md | 45 min | 45 min | `/backend/routes/sounds.js` |
| 2 | TASK_2_DETECTION_HISTORY.md | 45 min | 45 min | `/backend/routes/detections.js` |
| 3 | TASK_3_SETTINGS.md | 45 min | 45 min | `/backend/routes/settings.js` |
| 4 | TASK_4_AUDIO_RECORDING.md | 30 min | 60 min | `/backend/routes/audio.js` |

---

## How to Work in Parallel

### Backend
- **Shared**: Server runs on port 5000 (no conflicts)
- **Independent**: Each person modifies different route files
- **No conflicts**: Routes don't overlap (`/api/sounds`, `/api/detections`, `/api/settings`, `/api/audio`)

### Frontend
- **Shared**: Dev server runs on port 5174
- **Independent**: Each person modifies different page files
- **No conflicts**: Different pages/hooks don't interfere
- **Rebase as needed**: If conflicts arise, rebase against main

---

## Testing While Developing

### Test Backend Endpoints
Use curl or Postman to test as you build:
```bash
# Example for Person 1
curl http://localhost:5000/api/sounds
curl -X POST http://localhost:5000/api/sounds \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","color":"#3b82f6"}'
```

### Test Frontend Page
1. Start both dev servers
2. Navigate to your page in browser
3. Open DevTools console
4. Check for errors
5. Test the workflow described in your task

---

## Common Issues & Fixes

### Issue: Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Issue: Frontend can't reach backend
- Check backend is running: `curl http://localhost:5000/api/health`
- Check REACT_APP_API_URL env var is correct in frontend
- Check CORS is enabled in backend (it is by default)

### Issue: Git merge conflicts
- Keep your changes isolated to your task files
- If conflicts occur, resolve them and both versions are usually needed
- Push your branch and ask maintainer to merge

---

## Merge Strategy

**When everyone is done** (after 8 hours):

```bash
# Everyone commits their work
git add .
git commit -m "feat: complete [your task name]"
git push origin feature/person[x]-[task-name]

# Then merge in this order (no conflicts expected):
git checkout main
git merge feature/person1-sound-library
git merge feature/person2-detection-history
git merge feature/person3-settings
git merge feature/person4-audio-recording
git push origin main
```

---

## Success Checklist

**End of 8 Hours:**
- [ ] All 4 features implemented
- [ ] Backend running without errors
- [ ] Frontend running without errors
- [ ] Each person's feature works independently
- [ ] No console errors in browser
- [ ] All 4 branches merged to main
- [ ] Can navigate between all pages
- [ ] Full workflow works: Record → Save → View in Library → See in History

---

## Communication

- **Quick questions**: Slack/Discord in your team chat
- **Blockers**: @ mention person whose task you depend on
- **API format issues**: Share exact curl command and response

**Integration Points** (watch for these):
- Person 4 → Person 1: New sounds appear in library
- Person 4 → Person 2: Detections appear in history
- Everyone → Person 3: Can read settings if needed

---

## Additional Resources

- **Frontend**: React, TypeScript, React Router already set up
- **Backend**: Express, CORS already set up
- **API**: All utilities in `/frontend/src/lib/api.ts`
- **Hooks**: All data hooks ready to import and use

Good luck! 🚀
