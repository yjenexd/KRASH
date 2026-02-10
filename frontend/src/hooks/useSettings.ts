import { useState, useEffect } from 'react';
import { apiGet, apiPut } from '../lib/api';

interface Settings {
  sensitivity: number;
  hapticSync: boolean;
  notifications: boolean;
  soundAlerts: boolean;
}

const defaultSettings: Settings = {
  sensitivity: 50,
  hapticSync: true,
  notifications: true,
  soundAlerts: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/settings');
      setSettings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch settings');
    } finally {
      setLoading(false);
    }
  };

  // Update settings
  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      const updated = await apiPut('/settings', updates);
      setSettings(updated);
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, error, fetchSettings, updateSettings };
}
