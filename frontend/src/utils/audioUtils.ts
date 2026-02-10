// Utility functions for audio waveform visualization

export function drawWaveform(
  canvas: HTMLCanvasElement,
  audioBuffer: AudioBuffer,
  containerWidth: number = 400
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const width = containerWidth;
  const height = 100;
  canvas.width = width;
  canvas.height = height;

  // Fill background
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, width, height);

  // Get audio data
  const rawData = audioBuffer.getChannelData(0);
  const samples = Math.floor(rawData.length / width);
  const filteredData: number[] = [];

  // Downsample
  for (let i = 0; i < width; i++) {
    let sum = 0;
    for (let j = 0; j < samples; j++) {
      sum += Math.abs(rawData[i * samples + j]);
    }
    filteredData.push(sum / samples);
  }

  // Draw waveform
  const barWidth = width / filteredData.length;
  ctx.fillStyle = '#3b82f6';

  filteredData.forEach((value, index) => {
    const barHeight = value * height;
    ctx.fillRect(index * barWidth, height / 2 - barHeight / 2, barWidth - 2, barHeight);
  });
}

export function blobToWav(blob: Blob): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        resolve(audioBuffer);
      } catch (err) {
        reject(err);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read blob'));
    reader.readAsArrayBuffer(blob);
  });
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
