import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../lib/api';

interface Detection {
  id: string;
  name: string;
  color: string;
  timestamp: string;
}

export function useDetections() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all detections
  const fetchDetections = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet('/detections');
      setDetections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch detections');
    } finally {
      setLoading(false);
    }
  };

  // Log a detection
  const logDetection = async (soundName: string, soundColor: string) => {
    try {
      const newDetection = await apiPost('/detections', { soundName, soundColor });
      setDetections([newDetection, ...detections]);
      return newDetection;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to log detection');
      throw err;
    }
  };

  // Fetch on mount
  useEffect(() => {
    fetchDetections();
  }, []);

  return { detections, loading, error, fetchDetections, logDetection };
}
