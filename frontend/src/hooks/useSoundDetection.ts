import { useState, useRef, useCallback, useEffect } from 'react';
import {
  extractMfccFrames,
  findBestMatchFromBuffer,
  type AudioSignature,
} from '../utils/audioSignature';
import type { Sound } from './useSounds';

export interface DetectionEvent {
  id: string;
  name: string;
  color: string;
  score: number;
  timestamp: number;
}

interface UseSoundDetectionOptions {
  /** How often (ms) to analyse a window of mic audio. Default 500. */
  analyseInterval?: number;
  /** Minimum similarity score (0-1) to count as a match. Default 0.70. */
  threshold?: number;
  /** Cooldown (ms) before the same sound can be detected again. Default 3000. */
  cooldown?: number;
  /** Minimum RMS volume to bother analysing (prevents silence matching). Default 0.01. */
  silenceGate?: number;
}

/** Max MFCC frames to keep in the rolling buffer (~4 s at 48 kHz with hop 512). */
const MAX_BUFFER_FRAMES = 400;
/** Minimum frames required before we even attempt DTW comparison. */
const MIN_FRAMES_FOR_DTW = 20;

/**
 * Live microphone listener that continuously extracts MFCC frames,
 * accumulates them in a rolling buffer, and compares the temporal
 * pattern against calibrated sound signatures using DTW.
 */
export function useSoundDetection(
  sounds: Sound[],
  opts: UseSoundDetectionOptions = {},
) {
  const {
    analyseInterval = 500,
    threshold = 0.65,
    cooldown = 3000,
    silenceGate = 0.008,
  } = opts;

  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);   // 0-1 current mic volume
  const [lastDetection, setLastDetection] = useState<DetectionEvent | null>(null);

  // Refs to avoid stale closures
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastDetectedRef = useRef<Map<string, number>>(new Map()); // id -> timestamp
  const soundsRef = useRef(sounds);

  // Rolling buffer of MFCC frame vectors (accumulates over many intervals)
  const frameBufferRef = useRef<number[][]>([]);

  // Keep soundsRef current
  useEffect(() => {
    soundsRef.current = sounds;
  }, [sounds]);

  // ── Volume meter (runs on rAF while listening) ────────────────────────

  const updateVolume = useCallback(() => {
    if (!analyserRef.current) return;
    const data = new Float32Array(analyserRef.current.fftSize);
    analyserRef.current.getFloatTimeDomainData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i];
    setVolume(Math.min(1, Math.sqrt(sum / data.length) * 5)); // amplify a bit for UI
    rafRef.current = requestAnimationFrame(updateVolume);
  }, []);

  // ── Start / Stop ─────────────────────────────────────────────────────

  const startListening = useCallback(async () => {
    if (isListening) return;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    // Use a large FFT size to capture ~680 ms per read at 48 kHz.
    // This reduces the chance of missing audio between intervals.
    analyser.fftSize = 32768;
    source.connect(analyser);

    audioContextRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
    streamRef.current = stream;

    // Clear any stale frame buffer from a previous session
    frameBufferRef.current = [];

    setIsListening(true);

    // Start volume meter
    rafRef.current = requestAnimationFrame(updateVolume);

    // Periodic analysis – extract MFCC frames & accumulate
    intervalRef.current = window.setInterval(() => {
      if (!analyserRef.current || !audioContextRef.current) return;

      const bufferLength = analyserRef.current.fftSize;
      const samples = new Float32Array(bufferLength);
      analyserRef.current.getFloatTimeDomainData(samples);

      // Silence gate – skip quiet periods (but don't clear the buffer;
      // brief silences are a natural part of most sounds)
      let rmsCheck = 0;
      for (let i = 0; i < samples.length; i++) rmsCheck += samples[i] * samples[i];
      rmsCheck = Math.sqrt(rmsCheck / samples.length);
      if (rmsCheck < silenceGate) return;

      // Extract MFCC frames from this window and append to rolling buffer
      const sampleRate = audioContextRef.current.sampleRate;
      const newFrames = extractMfccFrames(samples, sampleRate);
      const buf = frameBufferRef.current;
      buf.push(...newFrames);

      // Cap buffer at MAX_BUFFER_FRAMES (drop oldest frames)
      if (buf.length > MAX_BUFFER_FRAMES) {
        buf.splice(0, buf.length - MAX_BUFFER_FRAMES);
      }

      // Need enough frames for meaningful DTW comparison
      if (buf.length < MIN_FRAMES_FOR_DTW) return;

      // Build library with only sounds that have signatures
      const library = soundsRef.current
        .filter((s): s is Sound & { signature: AudioSignature } => !!s.signature)
        .map((s) => ({
          id: s.id,
          name: s.name,
          color: s.color,
          signature: s.signature,
        }));

      if (library.length === 0) return;

      // For each calibrated sound, compare only the most recent N frames
      // (matching that sound's length) so different-length sounds are
      // compared fairly.
      const match = findBestMatchFromBuffer(buf, samples, library, threshold);

      if (match) {
        const now = Date.now();
        const lastTime = lastDetectedRef.current.get(match.id) ?? 0;
        if (now - lastTime > cooldown) {
          lastDetectedRef.current.set(match.id, now);
          const event: DetectionEvent = {
            id: match.id,
            name: match.name,
            color: match.color,
            score: match.score,
            timestamp: now,
          };
          setLastDetection(event);

          // After a successful detection, clear the buffer so we don't
          // keep re-matching the same audio
          frameBufferRef.current = [];
        }
      }
    }, analyseInterval);
  }, [isListening, analyseInterval, threshold, cooldown, silenceGate, updateVolume]);

  const stopListening = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    sourceRef.current?.disconnect();
    audioContextRef.current?.close();

    audioContextRef.current = null;
    analyserRef.current = null;
    sourceRef.current = null;
    streamRef.current = null;

    frameBufferRef.current = [];

    setIsListening(false);
    setVolume(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isListening) stopListening();
    };
  }, [isListening, stopListening]);

  return {
    isListening,
    volume,
    lastDetection,
    startListening,
    stopListening,
  };
}
