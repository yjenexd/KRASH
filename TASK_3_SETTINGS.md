# Person 3: Settings Feature

## Overview
You're building the **Settings** feature - the ability to read and persist user preferences like sensitivity, haptic sync, notifications, and sound alerts.

---

## Backend Tasks (45 min)

✅ **Already Done:**
- `/backend/routes/settings.js` - All endpoints created
- Data persistence set up

✅ **What you need to do:**
1. Backend server should already be running
2. Test your endpoints:
   ```bash
   # GET settings
   curl http://localhost:5000/api/settings
   
   # PUT (update) settings
   curl -X PUT http://localhost:5000/api/settings \
     -H "Content-Type: application/json" \
     -d '{"sensitivity":75,"hapticSync":false}'
   ```

---

## Frontend Tasks (45 min)

✅ **Already Done:**
- `/frontend/src/hooks/useSettings.ts` - Custom hook with fetch/update

**What you need to do:**
1. Open `/frontend/src/pages/Settings/Settings.tsx`
2. Import the hook:
   ```tsx
   import { useSettings } from '../../hooks/useSettings';
   ```

3. Replace the useState:
   ```tsx
   // DELETE THIS:
   const [settings, setSettings] = useState<SettingToggle[]>([...]);
   
   // ADD THIS:
   const { settings: apiSettings, updateSettings } = useSettings();
   ```

4. Create a settings state that matches your UI structure, then sync to API:
   ```tsx
   const [uiSettings, setUiSettings] = useState<SettingToggle[]>([
     {
       id: 'notifications',
       label: 'Push Notifications',
       description: 'Receive alerts when sounds are detected',
       icon: <Bell size={20} />,
       enabled: apiSettings.notifications,
     },
     // ... other settings
   ]);
   ```

5. Update the toggle handler to sync to API:
   ```tsx
   const toggleSetting = async (id: string) => {
     const updatedSettings = uiSettings.map(s => 
       s.id === id ? { ...s, enabled: !s.enabled } : s
     );
     setUiSettings(updatedSettings);
     
     // Map back to API format
     await updateSettings({
       notifications: updatedSettings.find(s => s.id === 'notifications')?.enabled,
       hapticSync: updatedSettings.find(s => s.id === 'haptic')?.enabled,
       // ... other mappings
     });
   };
   ```

6. Load settings on mount from hook

---

## Integration Points

Person 1 can use settings:
```tsx
const { settings } = useSettings();
console.log(settings.sensitivity); // 50
```

Person 4 can check haptic sync before triggering:
```tsx
const { settings } = useSettings();
if (settings.hapticSync) {
  triggerHapticFeedback();
}
```

---

## Testing (30 min)

1. **Backend**: Both endpoints work
2. **Frontend**:
   - Page loads settings from API
   - Can toggle each setting
   - Settings persist to API
   - Refresh page - settings still there
   - Loading state displays
   - Error messages show

---

## Definition of Done
- [ ] Backend endpoints tested and working
- [ ] Frontend loads real settings from API
- [ ] Can update each setting
- [ ] Settings persist across page refreshes
- [ ] Error handling in place
- [ ] No console errors
