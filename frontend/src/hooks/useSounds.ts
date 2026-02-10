import { useState, useEffect } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import type { AudioSignature } from '../utils/audioSignature';

export interface Sound {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  signature?: AudioSignature;
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

  // Add new sound (optionally with signature)
  const addSound = async (name: string, color: string, signature?: AudioSignature) => {
    try {
      const newSound = await apiPost('/sounds', { name, color, signature });
      setSounds([...sounds, newSound]);
      return newSound;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add sound');
      throw err;
    }
  };

  // Update a sound's signature
  const updateSignature = async (id: string, signature: AudioSignature) => {
    try {
      const updated = await apiPut(`/sounds/${id}/signature`, { signature });
      setSounds(sounds.map(s => (s.id === id ? updated : s)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update signature');
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

  return { sounds, loading, error, fetchSounds, addSound, updateSignature, deleteSound };
}
