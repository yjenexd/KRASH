import { useState, useRef } from 'react';
import { apiPost } from '../lib/api';

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<number | null>(null);
  const stopPromiseResolverRef = useRef<((blob: Blob | null) => void) | null>(null);

  const startRecording = async () => {
    try {
      setError(null);
      console.log('🎤 === STARTING RECORDING ===');
      console.log('1️⃣ Requesting getUserMedia...');
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('2️⃣ Stream obtained:', stream);
      console.log('   - Stream ID:', stream.id);
      console.log('   - Audio tracks:', stream.getAudioTracks().length);
      console.log('   - Video tracks:', stream.getVideoTracks().length);
      
      const audioTracks = stream.getAudioTracks();
      if (audioTracks.length === 0) {
        throw new Error('No audio tracks found in stream!');
      }
      
      audioTracks.forEach((track, idx) => {
        console.log(`   - Audio track ${idx}:`, {
          kind: track.kind,
          enabled: track.enabled,
          id: track.id,
          readyState: track.readyState,
        });
      });
      
      console.log('3️⃣ Creating MediaRecorder...');
      const mediaRecorder = new MediaRecorder(stream);
      console.log('   - MIME type:', mediaRecorder.mimeType);
      console.log('   - State:', mediaRecorder.state);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      console.log('4️⃣ Chunks array cleared. Ready for data.');

      // Handler for receiving audio data chunks
      mediaRecorder.ondataavailable = (event) => {
        console.log('📦 ondataavailable fired!');
        console.log('   - Data size:', event.data.size, 'bytes');
        console.log('   - Data type:', event.data.type);
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
          console.log(`✅ Chunk ${chunksRef.current.length} pushed. Total: ${chunksRef.current.length} chunks`);
        } else {
          console.log('⚠️ Empty chunk received (size: 0)');
        }
      };

      // Single onstop handler for all cases (manual stop or auto-stop)
      const mimeType = mediaRecorder.mimeType || 'audio/webm';
      mediaRecorder.onstop = () => {
        console.log('⏹️ === RECORDING STOPPED (onstop fired) ===');
        console.log('📊 Final chunk count:', chunksRef.current.length);
        console.log('💾 Total data collected:', chunksRef.current.reduce((sum, chunk) => sum + chunk.size, 0), 'bytes');
        
        // Clear timers
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        if (autoStopTimeoutRef.current) {
          clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = null;
        }
        
        // Create blob from chunks (DO NOT CLEAR CHUNKS BEFORE THIS!)
        console.log('🔄 Creating blob from', chunksRef.current.length, 'chunks');
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        console.log('✨ Blob created!');
        console.log('   - Size:', audioBlob.size, 'bytes');
        console.log('   - Type:', audioBlob.type);
        
        // Update UI state
        setIsRecording(false);
        setRecordingTime(0);
        
        // Stop all audio tracks
        mediaRecorderRef.current?.stream.getTracks().forEach((track, idx) => {
          console.log(`🛑 Stopping track ${idx}`);
          track.stop();
        });
        
        // If stopRecording is waiting for this, resolve it with the blob
        console.log('📤 Resolving promise with blob');
        if (stopPromiseResolverRef.current) {
          stopPromiseResolverRef.current(audioBlob);
          stopPromiseResolverRef.current = null;
        }
      };

      // Start recording with 100ms timeslice to trigger ondataavailable regularly
      console.log('5️⃣ Starting MediaRecorder.start(100)...');
      mediaRecorder.start(100);
      console.log('   ✅ MediaRecorder started in state:', mediaRecorder.state);
      
      setIsRecording(true);

      // Track recording time
      const startTime = Date.now();
      intervalRef.current = setInterval(() => {
        setRecordingTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);

      // Auto-stop after 10 seconds
      autoStopTimeoutRef.current = setTimeout(() => {
        console.log('⏰ === AUTO-STOP TIMEOUT REACHED ===');
        if (mediaRecorderRef.current?.state === 'recording') {
          console.log('🛑 Calling stop() due to timeout');
          mediaRecorderRef.current.stop();
        } else {
          console.log('⚠️ MediaRecorder not in recording state! State:', mediaRecorderRef.current?.state);
        }
      }, 10000);
      
      console.log('🎤 === RECORDING SETUP COMPLETE ===');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('❌ ERROR starting recording:', errorMsg);
      setError(errorMsg);
      setIsRecording(false);
    }
  };

  const stopRecording = async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      console.log('🛑 === stopRecording CALLED ===');

      if (!mediaRecorderRef.current) {
        console.log('⚠️ mediaRecorderRef.current is null!');
        resolve(null);
        return;
      }

      const currentState = mediaRecorderRef.current.state;
      console.log('📊 Current MediaRecorder state:', currentState);

      if (currentState === 'inactive') {
        console.log('⚠️ MediaRecorder already inactive. No recording to stop.');
        resolve(null);
        return;
      }

      // Set up the resolver that onstop handler will call when recording finishes
      console.log('🔗 Setting up stop promise resolver...');
      stopPromiseResolverRef.current = resolve;

      // Request any remaining data to be flushed
      console.log('📤 Requesting final audio data with requestData()...');
      mediaRecorderRef.current.requestData();

      // Stop the recording immediately
      console.log('🛑 Calling MediaRecorder.stop()...');
      if (mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        console.log('   ✅ stop() called successfully');
      } else {
        console.log('⚠️ Cannot stop - MediaRecorder state is:', mediaRecorderRef.current.state);
      }
      
      console.log('🛑 === stopRecording function exiting (waiting for onstop callback) ===');
    });
  };

  const saveAudio = async (audioBlob: Blob, fileName: string) => {
    console.log('💾 saveAudio called. Blob size:', audioBlob.size, 'bytes');
    
    if (audioBlob.size === 0) {
      console.error('⚠️ WARNING: Audio blob is empty! No data to save.');
    }
    
    setLoading(true);
    setError(null);
    try {
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const audioData = reader.result as string;
            console.log('📤 AudioData prepared. Data URL length:', audioData.length);
            console.log('📤 Uploading to /api/audio with filename:', fileName);
            
            const result = await apiPost('/audio', { audioData, fileName });
            console.log('✅ Audio saved successfully:', result);
            resolve(result);
          } catch (err) {
            console.error('❌ Failed to upload audio:', err);
            reject(err);
          } finally {
            setLoading(false);
          }
        };
        
        reader.onerror = () => {
          console.error('❌ FileReader error');
          setError('Failed to read audio file');
          setLoading(false);
          reject(new Error('Failed to read audio file'));
        };
        
        console.log('📖 Starting FileReader.readAsDataURL()...');
        reader.readAsDataURL(audioBlob);
      });
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save audio';
      console.error('❌ Error in saveAudio:', errorMsg);
      setError(errorMsg);
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
