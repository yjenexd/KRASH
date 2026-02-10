# Person 1: Sound Library Feature

## Overview
You're building the **Sound Library** feature - the ability to browse, add, and delete sounds from the database.

---

## Backend Tasks (45 min)

✅ **Already Done:**
- `/backend/routes/sounds.js` - All endpoints created
- Data persistence set up

✅ **What you need to do:**
1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Start the backend server:
   ```bash
   npm run dev
   ```

3. Test your endpoints with curl or Postman:
   ```bash
   # GET all sounds
   curl http://localhost:5000/api/sounds
   
   # POST new sound
   curl -X POST http://localhost:5000/api/sounds \
     -H "Content-Type: application/json" \
     -d '{"name":"Doorbell","color":"#f59e0b"}'
   
   # DELETE sound
   curl -X DELETE http://localhost:5000/api/sounds/{id}
   ```

---

## Frontend Tasks (45 min)

✅ **Already Done:**
- `/frontend/src/lib/api.ts` - Shared API utilities
- `/frontend/src/hooks/useSounds.ts` - Custom hook with fetch/add/delete

**What you need to do:**
1. Open `/frontend/src/pages/SoundLibrary/SoundLibrary.tsx`
2. Import the hook:
   ```tsx
   import { useSounds } from '../../hooks/useSounds';
   ```

3. Replace the useState with the hook:
   ```tsx
   // DELETE THIS:
   const [sounds] = useState<Sound[]>([...]);
   
   // ADD THIS:
   const { sounds, loading, error, addSound, deleteSound } = useSounds();
   ```

4. Wire up the "Add New Sound" button to open calibrate (already done)

5. Wire up delete buttons:
   ```tsx
   onClick={() => deleteSound(sound.id)}
   ```

6. Add loading/error states to the UI

---

## Testing (30 min)

1. **Backend**: All 3 endpoints respond correctly
2. **Frontend**: 
   - Page loads and shows sounds from API
   - Can add new sounds
   - Can delete sounds
   - Loading state displays while fetching
   - Error messages show if API fails

---

## Definition of Done
- [ ] Backend endpoints tested and working
- [ ] Frontend loads real sounds from API
- [ ] Add/delete functionality works
- [ ] Error handling in place
- [ ] No console errors or warnings
