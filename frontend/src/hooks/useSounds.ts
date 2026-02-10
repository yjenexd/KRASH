import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiDelete } from '../lib/api';

interface Sound {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export function useSounds() {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all sounds
  const fetchSounds = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/sounds');
      setSounds(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sounds');
    } finally {
      setLoading(false);
    }
  };

  // Add new sound
  const addSound = async (name: string, color: string) => {
    try {
      const newSound = await apiPost('/sounds', { name, color });
      setSounds([...sounds, newSound]);
      return newSound;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sound');
      throw err;
    }
  };

  // Delete sound
  const deleteSound = async (id: string) => {
    try {
      await apiDelete(`/sounds/${id}`);
      setSounds(sounds.filter(s => s.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sound');
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchSounds();
  }, []);

  return { sounds, loading, error, fetchSounds, addSound, deleteSound };
}
