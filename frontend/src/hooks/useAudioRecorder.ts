import { useState, useRef } from 'react';
import { apiPost } from '../lib/api';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        chunksRef.current.push(event.data);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Track recording time
      const startTime = Date.now();
      const interval = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);

      // Auto-stop after 10 seconds
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          clearInterval(interval);
        }
      }, 10000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording');
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current) {
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        setIsRecording(false);
        setRecordingTime(0);
        
        // Stop all tracks
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
        
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  };

  const saveAudio = async (audioBlob: Blob, fileName: string) => {
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const audioData = reader.result as string;
            const result = await apiPost('/audio', { audioData, fileName });
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          setError('Failed to read audio file');
          setLoading(false);
          reject(new Error('Failed to read audio file'));
        };
        
        reader.readAsDataURL(audioBlob);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save audio');
      setLoading(false);
      throw err;
    }
  };

  return {
    isRecording,
    recordingTime,
    loading,
    error,
    startRecording,
    stopRecording,
    saveAudio,
  };
}
