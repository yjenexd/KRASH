/**
 * Audio Signature Extraction & Matching
 *
 * Extracts a full frame-level fingerprint from an audio sample:
 *   - MFCC frame sequence   (temporal pattern – primary matching signal)
 *   - MFCC mean + variance  (aggregate timbre for quick screening)
 *   - RMS                   (loudness)
 *   - ZCR                   (noisiness / sharpness)
 *
 * Matching uses **Dynamic Time Warping (DTW)** on the MFCC frame sequence
 * so the temporal shape of the sound must match, not just summary statistics.
 */

// ── Types ──────────────────────────────────────────────────────────────

export interface AudioSignature {
  mfccMean: number[];      // 13 coefficients – mean across frames
  mfccVariance: number[];  // 13 coefficients – variance across frames
  mfccFrames: number[][];  // per-frame MFCC vectors – temporal pattern
  rms: number;             // root-mean-square energy
  zcr: number;             // zero-crossing rate (crossings / sample)
}

// ── Constants ──────────────────────────────────────────────────────────

const NUM_MFCC = 13;
const FFT_SIZE = 2048;
const HOP_SIZE = 512;
const NUM_MEL_FILTERS = 26;
const MIN_FREQ = 0;
const MAX_FREQ = 8000; // Nyquist-ish ceiling for speech / household sounds

// ── Public API ─────────────────────────────────────────────────────────

/**
 * Extract a full signature from a recorded Blob (WAV / WebM / etc.)
 * Uses the Web Audio OfflineAudioContext to decode the blob first.
 */
export async function extractSignatureFromBlob(
  blob: Blob,
): Promise<AudioSignature> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioCtx = new OfflineAudioContext(1, 1, 44100);  // temp context for decoding
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  return extractSignature(audioBuffer);
}

/**
 * Extract a signature from an already-decoded AudioBuffer.
 */
export function extractSignature(buffer: AudioBuffer): AudioSignature {
  // Work with mono – take the first channel
  const samples = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;

  const rms = computeRMS(samples);
  const zcr = computeZCR(samples);
  const { mean: mfccMean, variance: mfccVariance, frames: mfccFrames } = computeMFCC(
    samples,
    sampleRate,
  );

  return { mfccMean, mfccVariance, mfccFrames, rms, zcr };
}

/**
 * Extract a signature directly from a Float32Array of raw PCM samples.
 * Useful for live mic analysis where we already have the samples buffer.
 */
export function extractSignatureFromSamples(
  samples: Float32Array,
  sampleRate: number,
): AudioSignature {
  const rms = computeRMS(samples);
  const zcr = computeZCR(samples);
  const { mean: mfccMean, variance: mfccVariance, frames: mfccFrames } = computeMFCC(
    samples,
    sampleRate,
  );
  return { mfccMean, mfccVariance, mfccFrames, rms, zcr };
}

/**
 * Extract only the per-frame MFCC vectors from raw samples.
 * Used by live detection to accumulate frames over time without
 * building a full signature each interval.
 */
export function extractMfccFrames(
  samples: Float32Array,
  sampleRate: number,
): number[][] {
  const { frames } = computeMFCC(samples, sampleRate);
  return frames;
}

// ── Matching / Comparison ──────────────────────────────────────────────

/**
 * Compute a similarity score (0 – 1) between two signatures.
 *
 * Primary signal: **DTW distance** on per-frame MFCC sequences.
 * This ensures the temporal pattern of the sound must match – a clap vs
 * a whistle will score low even if their mean MFCCs are similar.
 *
 * Secondary: RMS and ZCR log-ratios act as quick sanity checks.
 *
 * Higher = more similar.
 */
export function compareSignatures(
  live: AudioSignature,
  calibrated: AudioSignature,
): number {
  // ── 1. DTW on MFCC frame sequences (temporal pattern) ─────────────
  const liveFrames = live.mfccFrames;
  const calFrames = calibrated.mfccFrames;

  let dtwSim = 0;

  if (liveFrames.length >= 3 && calFrames.length >= 3) {
    // Normalise both sequences to have zero mean per-coefficient
    // so amplitude/mic differences don't dominate
    const normLive = normaliseFrames(liveFrames);
    const normCal = normaliseFrames(calFrames);

    const dist = dtwDistance(normLive, normCal);
    // Convert distance → similarity via Gaussian kernel.
    // With unit-normalised frames, distances range ~0.2 (similar) to ~1.4 (different).
    // σ=0.8 means a per-step distance of 0.8 maps to ~0.5 similarity.
    const DTW_SIGMA = 0.8;
    dtwSim = Math.exp(-(dist * dist) / (2 * DTW_SIGMA * DTW_SIGMA));
  } else {
    // Not enough frames for DTW – fall back to aggregate MFCC comparison
    dtwSim = aggregateMfccSimilarity(live, calibrated);
  }

  // Pure pattern matching – volume (RMS) and noisiness (ZCR) are ignored
  // so that distance from the mic doesn't affect detection.
  return dtwSim;
}

/** Fallback MFCC comparison when we don't have enough frames for DTW. */
function aggregateMfccSimilarity(
  live: AudioSignature,
  calibrated: AudioSignature,
): number {
  const EPS_VAR = 0.5;
  let sqDiffSum = 0;
  for (let i = 0; i < live.mfccMean.length; i++) {
    const diff = live.mfccMean[i] - calibrated.mfccMean[i];
    const weight = 1 / (calibrated.mfccVariance[i] + EPS_VAR);
    sqDiffSum += diff * diff * weight;
  }
  const mfccDist = Math.sqrt(sqDiffSum / live.mfccMean.length);
  const SIGMA = 2.0;
  return Math.exp(-(mfccDist * mfccDist) / (2 * SIGMA * SIGMA));
}

// ── Dynamic Time Warping ───────────────────────────────────────────────

/**
 * DTW distance between two MFCC frame sequences.
 * Uses Sakoe-Chiba band constraint for efficiency and a memory-efficient
 * two-row implementation (O(m) memory instead of O(n×m)).
 *
 * Returns the **average per-step Euclidean distance** along the optimal
 * warping path, so the result is independent of sequence length.
 */
function dtwDistance(seq1: number[][], seq2: number[][]): number {
  const n = seq1.length;
  const m = seq2.length;
  if (n === 0 || m === 0) return Infinity;

  // Sakoe-Chiba band: allow up to 25 % warping + a minimum of 10 frames
  const band = Math.max(Math.ceil(Math.max(n, m) * 0.25), 10);

  // Two-row DP – prev = row i-1, curr = row i
  let prev = new Float64Array(m + 1).fill(Infinity);
  let curr = new Float64Array(m + 1).fill(Infinity);
  prev[0] = 0;

  for (let i = 1; i <= n; i++) {
    curr.fill(Infinity);
    const jCenter = Math.round((i * m) / n);
    const jMin = Math.max(1, jCenter - band);
    const jMax = Math.min(m, jCenter + band);

    for (let j = jMin; j <= jMax; j++) {
      const cost = frameEuclidean(seq1[i - 1], seq2[j - 1]);
      curr[j] = cost + Math.min(prev[j], curr[j - 1], prev[j - 1]);
    }

    // Swap rows
    [prev, curr] = [curr, prev];
  }

  // Normalise by the longer sequence length so the score is length-independent
  return prev[m] / Math.max(n, m);
}

/** Euclidean distance between two MFCC frame vectors. */
function frameEuclidean(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    sum += d * d;
  }
  return Math.sqrt(sum);
}

/**
 * Normalise MFCC frames so only the *shape* matters, not volume:
 * 1. Zero-mean each coefficient across frames (removes mic DC bias).
 * 2. Scale each frame vector to unit length (removes overall energy).
 */
function normaliseFrames(frames: number[][]): number[][] {
  if (frames.length === 0) return frames;
  const numCoeffs = frames[0].length;
  const means = new Array(numCoeffs).fill(0);

  for (const f of frames) {
    for (let j = 0; j < numCoeffs; j++) means[j] += f[j];
  }
  for (let j = 0; j < numCoeffs; j++) means[j] /= frames.length;

  // Zero-mean then unit-normalise each frame
  return frames.map((f) => {
    const centered = f.map((v, j) => v - means[j]);
    let norm = 0;
    for (const c of centered) norm += c * c;
    norm = Math.sqrt(norm);
    if (norm < 1e-8) return centered; // avoid div-by-zero for silent frames
    return centered.map((c) => c / norm);
  });
}

/**
 * Given a live signature and a library of calibrated signatures, find
 * the best match that exceeds the given threshold (0-1).
 * Returns null if nothing is close enough.
 */
export function findBestMatch(
  live: AudioSignature,
  library: { id: string; name: string; color: string; signature: AudioSignature }[],
  threshold = 0.65,
): { id: string; name: string; color: string; score: number } | null {
  let best: { id: string; name: string; color: string; score: number } | null = null;

  for (const entry of library) {
    const score = compareSignatures(live, entry.signature);
    if (score >= threshold && (!best || score > best.score)) {
      best = { id: entry.id, name: entry.name, color: entry.color, score };
    }
  }

  return best;
}

/**
 * Given a rolling buffer of live MFCC frames and a library of calibrated
 * sounds, find the best match. For each calibrated sound, only the most
 * recent N frames (where N = that sound's frame count) are compared
 * via DTW so that different-length sounds are compared fairly.
 *
 * Returns null if nothing exceeds the threshold.
 */
export function findBestMatchFromBuffer(
  frameBuffer: number[][],
  currentSamples: Float32Array,
  library: { id: string; name: string; color: string; signature: AudioSignature }[],
  threshold = 0.65,
): { id: string; name: string; color: string; score: number } | null {
  let best: { id: string; name: string; color: string; score: number } | null = null;

  for (const entry of library) {
    const calFrameCount = entry.signature.mfccFrames.length;
    if (calFrameCount < 3) continue;

    // Need at least 40% of the calibrated sound's frames in the buffer
    const minRequired = Math.max(8, Math.ceil(calFrameCount * 0.4));
    if (frameBuffer.length < minRequired) continue;

    // Take the most recent N frames (matching calibrated sound length)
    // Allow some slack – take up to 1.3x the calibrated frame count
    const windowSize = Math.min(
      frameBuffer.length,
      Math.ceil(calFrameCount * 1.3),
    );
    const windowFrames = frameBuffer.slice(frameBuffer.length - windowSize);

    // Build a temporary signature from this window
    const liveSig = buildSignatureFromFrames(windowFrames, currentSamples);
    const score = compareSignatures(liveSig, entry.signature);

    if (score >= threshold && (!best || score > best.score)) {
      best = { id: entry.id, name: entry.name, color: entry.color, score };
    }
  }

  return best;
}

/** Build an AudioSignature from a set of MFCC frames + raw samples (for RMS/ZCR). */
function buildSignatureFromFrames(
  mfccFrames: number[][],
  samples: Float32Array,
): AudioSignature {
  const numCoeffs = mfccFrames[0]?.length ?? 13;
  const mean = new Array(numCoeffs).fill(0);
  const variance = new Array(numCoeffs).fill(0);

  for (const f of mfccFrames) {
    for (let j = 0; j < numCoeffs; j++) mean[j] += f[j];
  }
  for (let j = 0; j < numCoeffs; j++) mean[j] /= mfccFrames.length;

  for (const f of mfccFrames) {
    for (let j = 0; j < numCoeffs; j++) variance[j] += (f[j] - mean[j]) ** 2;
  }
  for (let j = 0; j < numCoeffs; j++) variance[j] /= mfccFrames.length;

  let rmsSum = 0;
  for (let i = 0; i < samples.length; i++) rmsSum += samples[i] * samples[i];
  const rms = Math.sqrt(rmsSum / samples.length);

  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if (
      (samples[i] >= 0 && samples[i - 1] < 0) ||
      (samples[i] < 0 && samples[i - 1] >= 0)
    ) crossings++;
  }
  const zcr = crossings / samples.length;

  return { mfccMean: mean, mfccVariance: variance, mfccFrames, rms, zcr };
}

// ── Internal Helpers ───────────────────────────────────────────────────

function computeRMS(samples: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i] * samples[i];
  }
  return Math.sqrt(sum / samples.length);
}

function computeZCR(samples: Float32Array): number {
  let crossings = 0;
  for (let i = 1; i < samples.length; i++) {
    if ((samples[i] >= 0 && samples[i - 1] < 0) || (samples[i] < 0 && samples[i - 1] >= 0)) {
      crossings++;
    }
  }
  return crossings / samples.length;
}

// ── MFCC Pipeline ──────────────────────────────────────────────────────

function computeMFCC(
  samples: Float32Array,
  sampleRate: number,
): { mean: number[]; variance: number[]; frames: number[][] } {
  const signalFrames = frameSignal(samples, FFT_SIZE, HOP_SIZE);
  if (signalFrames.length === 0) {
    return {
      mean: new Array(NUM_MFCC).fill(0),
      variance: new Array(NUM_MFCC).fill(0),
      frames: [],
    };
  }

  const melFilterbank = createMelFilterbank(
    FFT_SIZE,
    sampleRate,
    NUM_MEL_FILTERS,
    MIN_FREQ,
    MAX_FREQ,
  );

  const dctMatrix = createDCTMatrix(NUM_MFCC, NUM_MEL_FILTERS);

  // MFCC for every frame
  const allMfcc: number[][] = signalFrames.map((frame) => {
    const windowed = applyHann(frame);
    const spectrum = fftMagnitude(windowed);
    const melEnergies = applyMelFilterbank(spectrum, melFilterbank);
    const logMel = melEnergies.map((e) => Math.log(Math.max(e, 1e-10)));
    return applyDCT(logMel, dctMatrix);
  });

  // Mean and variance across frames
  const mean = new Array(NUM_MFCC).fill(0);
  const variance = new Array(NUM_MFCC).fill(0);

  for (const mfcc of allMfcc) {
    for (let j = 0; j < NUM_MFCC; j++) {
      mean[j] += mfcc[j];
    }
  }
  for (let j = 0; j < NUM_MFCC; j++) {
    mean[j] /= allMfcc.length;
  }

  for (const mfcc of allMfcc) {
    for (let j = 0; j < NUM_MFCC; j++) {
      variance[j] += (mfcc[j] - mean[j]) ** 2;
    }
  }
  for (let j = 0; j < NUM_MFCC; j++) {
    variance[j] /= allMfcc.length;
  }

  return { mean, variance, frames: allMfcc };
}

// ── Framing & Windowing ────────────────────────────────────────────────

function frameSignal(
  samples: Float32Array,
  frameSize: number,
  hopSize: number,
): Float32Array[] {
  const frames: Float32Array[] = [];
  for (let start = 0; start + frameSize <= samples.length; start += hopSize) {
    frames.push(samples.slice(start, start + frameSize));
  }
  return frames;
}

function applyHann(frame: Float32Array): Float32Array {
  const out = new Float32Array(frame.length);
  for (let i = 0; i < frame.length; i++) {
    const w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (frame.length - 1)));
    out[i] = frame[i] * w;
  }
  return out;
}

// ── FFT (radix-2 Cooley–Tukey, in-place) ──────────────────────────────

function fftMagnitude(frame: Float32Array): Float32Array {
  const N = frame.length;
  // Ensure power-of-two
  const real = new Float64Array(N);
  const imag = new Float64Array(N);
  for (let i = 0; i < N; i++) real[i] = frame[i];

  fftInPlace(real, imag);

  // Only need first half (Nyquist)
  const half = N / 2 + 1;
  const mag = new Float32Array(half);
  for (let i = 0; i < half; i++) {
    mag[i] = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);
  }
  return mag;
}

function fftInPlace(real: Float64Array, imag: Float64Array): void {
  const N = real.length;
  // Bit-reversal permutation
  for (let i = 1, j = 0; i < N; i++) {
    let bit = N >> 1;
    for (; j & bit; bit >>= 1) {
      j ^= bit;
    }
    j ^= bit;
    if (i < j) {
      [real[i], real[j]] = [real[j], real[i]];
      [imag[i], imag[j]] = [imag[j], imag[i]];
    }
  }

  // Cooley–Tukey
  for (let len = 2; len <= N; len <<= 1) {
    const halfLen = len >> 1;
    const angle = (-2 * Math.PI) / len;
    const wR = Math.cos(angle);
    const wI = Math.sin(angle);

    for (let start = 0; start < N; start += len) {
      let curR = 1;
      let curI = 0;
      for (let k = 0; k < halfLen; k++) {
        const evenIdx = start + k;
        const oddIdx = start + k + halfLen;

        const tR = curR * real[oddIdx] - curI * imag[oddIdx];
        const tI = curR * imag[oddIdx] + curI * real[oddIdx];

        real[oddIdx] = real[evenIdx] - tR;
        imag[oddIdx] = imag[evenIdx] - tI;
        real[evenIdx] += tR;
        imag[evenIdx] += tI;

        const newCurR = curR * wR - curI * wI;
        curI = curR * wI + curI * wR;
        curR = newCurR;
      }
    }
  }
}

// ── Mel Filterbank ─────────────────────────────────────────────────────

function hzToMel(hz: number): number {
  return 2595 * Math.log10(1 + hz / 700);
}

function melToHz(mel: number): number {
  return 700 * (10 ** (mel / 2595) - 1);
}

function createMelFilterbank(
  fftSize: number,
  sampleRate: number,
  numFilters: number,
  minFreq: number,
  maxFreq: number,
): Float32Array[] {
  const nfft = fftSize / 2 + 1;
  const melMin = hzToMel(minFreq);
  const melMax = hzToMel(maxFreq);

  // numFilters + 2 points (including edges)
  const melPoints: number[] = [];
  for (let i = 0; i <= numFilters + 1; i++) {
    melPoints.push(melMin + (i * (melMax - melMin)) / (numFilters + 1));
  }

  const binPoints = melPoints.map((m) =>
    Math.floor(((fftSize + 1) * melToHz(m)) / sampleRate),
  );

  const filters: Float32Array[] = [];
  for (let i = 0; i < numFilters; i++) {
    const filt = new Float32Array(nfft);
    const left = binPoints[i];
    const center = binPoints[i + 1];
    const right = binPoints[i + 2];

    for (let k = left; k < center; k++) {
      filt[k] = (k - left) / (center - left);
    }
    for (let k = center; k <= right; k++) {
      filt[k] = (right - k) / (right - center);
    }
    filters.push(filt);
  }

  return filters;
}

function applyMelFilterbank(
  spectrum: Float32Array,
  filters: Float32Array[],
): number[] {
  return filters.map((filt) => {
    let sum = 0;
    const len = Math.min(spectrum.length, filt.length);
    for (let i = 0; i < len; i++) {
      sum += spectrum[i] * filt[i];
    }
    return sum;
  });
}

// ── DCT (Type-II, for MFCC) ───────────────────────────────────────────

function createDCTMatrix(numCoeffs: number, numFilters: number): number[][] {
  const matrix: number[][] = [];
  for (let k = 0; k < numCoeffs; k++) {
    const row: number[] = [];
    for (let n = 0; n < numFilters; n++) {
      row.push(Math.cos((Math.PI * k * (n + 0.5)) / numFilters));
    }
    matrix.push(row);
  }
  return matrix;
}

function applyDCT(logMel: number[], matrix: number[][]): number[] {
  return matrix.map((row) => {
    let sum = 0;
    for (let i = 0; i < row.length; i++) {
      sum += row[i] * logMel[i];
    }
    return sum;
  });
}

// ── Vector maths ───────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}
