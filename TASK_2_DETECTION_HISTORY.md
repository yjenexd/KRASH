# Person 2: Detection History Feature

## Overview
You're building the **Detection History** feature - the ability to view and log sound detections with timestamps.

---

## Backend Tasks (45 min)

✅ **Already Done:**
- `/backend/routes/detections.js` - All endpoints created
- Data persistence set up

✅ **What you need to do:**
1. Backend server should already be running from Person 1
2. Test your endpoints with curl:
   ```bash
   # GET all detections
   curl http://localhost:5000/api/detections
   
   # POST new detection
   curl -X POST http://localhost:5000/api/detections \
     -H "Content-Type: application/json" \
     -d '{"soundName":"Baby Crying","soundColor":"#3b82f6"}'
   ```

---

## Frontend Tasks (45 min)

✅ **Already Done:**
- `/frontend/src/hooks/useDetections.ts` - Custom hook with fetch/log detection

**What you need to do:**
1. Open `/frontend/src/pages/History/History.tsx`
2. Import the hook:
   ```tsx
   import { useDetections } from '../../hooks/useDetections';
   ```

3. Replace the useState:
   ```tsx
   // DELETE THIS:
   const [historyItems] = useState<HistoryItem[]>([...]);
   
   // ADD THIS:
   const { detections, loading, error, fetchDetections } = useDetections();
   ```

4. Update the grouping logic to use `detections` instead of `historyItems`

5. Add helper function to format timestamps:
   ```tsx
   const groupByDate = (detections: Detection[]) => {
     return detections.reduce((acc, detection) => {
       const date = new Date(detection.timestamp).toLocaleDateString();
       if (!acc[date]) acc[date] = [];
       acc[date].push(detection);
       return acc;
     }, {} as Record<string, Detection[]>);
   };
   ```

6. Add loading/error states to the UI

---

## Integration Point

When Person 4 (Audio Recording) logs a detection, they'll call:
```tsx
const { logDetection } = useDetections();
logDetection('Baby Crying', '#3b82f6');
```

This will automatically add to the history!

---

## Testing (30 min)

1. **Backend**: Both endpoints work
2. **Frontend**:
   - Page loads and shows detections from API
   - Detections are grouped by date
   - Loading state displays
   - Error messages show
   - Integration: Person 4 can log detections that appear here

---

## Definition of Done
- [ ] Backend endpoints tested and working
- [ ] Frontend loads real detections from API
- [ ] Detections properly grouped by date
- [ ] Error handling in place
- [ ] No console errors
