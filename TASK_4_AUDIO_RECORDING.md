# Person 4: Audio Recording & Calibration Feature

## Overview
You're building the **Calibration** feature - recording audio, labeling it, assigning colors, and saving sounds to the library.

---

## Backend Tasks (30 min)

✅ **Already Done:**
- `/backend/routes/audio.js` - Audio save endpoint created

✅ **What you need to do:**
1. Backend server should already be running
2. Test your endpoint:
   ```bash
   curl -X POST http://localhost:5000/api/audio \
     -H "Content-Type: application/json" \
     -d '{
       "audioData": "data:audio/wav;base64,UklGRi4AAAASVA...",
       "fileName": "baby-crying.wav"
     }'
   ```

---

## Frontend Tasks (1 hour)

✅ **Already Done:**
- `/frontend/src/hooks/useAudioRecorder.ts` - Recording logic
- `/frontend/src/utils/audioUtils.ts` - Audio utilities

**What you need to do:**
1. Open `/frontend/src/pages/CalibrateSound/CalibrateSound.tsx`
2. Import the hooks:
   ```tsx
   import { useAudioRecorder } from '../../hooks/useAudioRecorder';
   import { useSounds } from '../../hooks/useSounds';
   import { useDetections } from '../../hooks/useDetections';
   import { formatTime } from '../../utils/audioUtils';
   ```

3. Update the component to use the hooks:
   ```tsx
   const { 
     isRecording, 
     recordingTime, 
     startRecording, 
     stopRecording, 
     saveAudio 
   } = useAudioRecorder();
   const { addSound } = useSounds();
   const { logDetection } = useDetections();
   ```

4. Wire up the record button:
   ```tsx
   const handleStartRecording = async () => {
     if (isRecording) {
       const audioBlob = await stopRecording();
       // Audio recorded successfully
     } else {
       await startRecording();
     }
   };
   ```

5. Wire up the save button:
   ```tsx
   const handleSave = async () => {
     if (!soundLabel || !selectedColor) {
       alert('Please enter a sound name and select a color');
       return;
     }

     try {
       // Get the recorded audio blob
       const audioBlob = await stopRecording();
       if (!audioBlob) {
         alert('No audio recorded');
         return;
       }

       // Save audio file to backend
       const audioResult = await saveAudio(audioBlob, `${soundLabel}.wav`);

       // Add sound to library
       const newSound = await addSound(soundLabel, selectedColor);

       // Log detection
       await logDetection(soundLabel, selectedColor);

       // Navigate back to home
       navigate('/');
     } catch (error) {
       console.error('Failed to save sound:', error);
       alert('Failed to save sound');
     }
   };
   ```

6. Update the recording time display to use the hook:
   ```tsx
   <span className="current-time">{formatTime(recordingTime)}</span>
   ```

---

## Key Integration Points

This feature integrates with:
- **Person 1** (Sound Library): Your saved sounds appear there
- **Person 2** (History): Each calibration logs a detection
- **Person 3** (Settings): Checks haptic sync before saving

---

## Testing (30 min)

1. **Backend**: Audio endpoint receives and saves files
2. **Frontend**:
   - Can start/stop recording
   - Recording time updates
   - Can label the sound
   - Can select color
   - Can save sound
   - Sound appears in Sound Library (Person 1)
   - Detection appears in History (Person 2)
   - Error handling for permission denied

---

## Definition of Done
- [ ] Backend audio endpoint tested and working
- [ ] Can record audio from microphone
- [ ] Recording timer works
- [ ] Can label and color pick
- [ ] Can save complete sound
- [ ] Sound appears in library
- [ ] Detection logged to history
- [ ] Error handling in place
- [ ] No console errors
