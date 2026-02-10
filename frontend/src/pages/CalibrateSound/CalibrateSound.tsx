import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mic } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useSounds } from '../../hooks/useSounds';
import { useDetections } from '../../hooks/useDetections';
import { formatTime } from '../../utils/audioUtils';
import './CalibrateSound.css';

const PRESET_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // orange
  '#ef4444', // red
  '#22c55e', // green
  '#a855f7', // purple
];

export default function CalibrateSound() {
  const navigate = useNavigate();
  const [soundLabel, setSoundLabel] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [showCustomColor, setShowCustomColor] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  
  const { 
    isRecording, 
    recordingTime, 
    startRecording, 
    stopRecording, 
    saveAudio 
  } = useAudioRecorder();
  const { addSound } = useSounds();
  const { logDetection } = useDetections();

  const handleStartRecording = async () => {
    try {
      if (isRecording) {
        console.log('🛑 STOP button clicked - stopping recording');
        const blob = await stopRecording();
        console.log('✅ Recording stopped. Blob:', blob?.size, 'bytes');
        
        if (blob && blob.size > 0) {
          setRecordedBlob(blob);
          console.log('💾 Recording saved to state. Ready for labeling.');
        } else {
          alert('⚠️ Recording was empty. Please try again.');
          setRecordedBlob(null);
        }
      } else {
        console.log('🎤 START button clicked - starting recording');
        setRecordedBlob(null); // Clear previous recording when starting new one
        await startRecording();
        console.log('✅ Recording started');
      }
    } catch (error) {
      console.error('❌ Error in handleStartRecording:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleSave = async () => {
    if (!soundLabel || !selectedColor) {
      alert('Please enter a sound name and select a color');
      return;
    }

    if (!recordedBlob) {
      alert('No audio recorded. Please record first.');
      return;
    }

    try {
      console.log('💾 Saving recording with label:', soundLabel, 'color:', selectedColor);
      
      // Save audio file to backend
      await saveAudio(recordedBlob, `${soundLabel}.wav`);
      console.log('✅ Audio uploaded to backend');

      // Add sound to library
      await addSound(soundLabel, selectedColor);
      console.log('✅ Sound added to library');

      // Log detection
      await logDetection(soundLabel, selectedColor);
      console.log('✅ Detection logged');

      // Navigate back to home
      navigate('/');
    } catch (error) {
      console.error('Failed to save sound:', error);
      alert('Failed to save sound: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  return (
    <div className="calibrate-page">
      <div className="calibrate-header">
        <button className="back-button" onClick={() => navigate('/')}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="calibrate-title">Calibrate Sound</h1>
      </div>

      <div className="calibrate-content">
        <section className="calibrate-section">
          <h2 className="section-title">1. Record Audio</h2>
          <div className="record-area">
            {!recordedBlob ? (
              <>
                <button
                  className={`record-button ${isRecording ? 'recording' : ''}`}
                  onClick={handleStartRecording}
                  title={isRecording ? 'Click to stop recording' : 'Click to start recording'}
                  disabled={isRecording && recordedBlob !== null}
                >
                  <Mic size={32} />
                </button>
                
                <div className="record-button-label">
                  {isRecording ? (
                    <span className="recording-label">🔴 RECORDING... Click to Stop</span>
                  ) : (
                    <span className="idle-label">▶️ Click to Record</span>
                  )}
                </div>
              </>
            ) : (
              <div className="saved-recording-message">
                <div className="checkmark-icon">✅</div>
                <div className="saved-text">Recording Saved</div>
                <div className="recording-size">{(recordedBlob.size / 1024).toFixed(2)} KB</div>
                <button 
                  className="re-record-button"
                  onClick={() => setRecordedBlob(null)}
                >
                  🔄 Re-record
                </button>
              </div>
            )}
            
            <div className="waveform">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className="waveform-bar"
                  style={{
                    height: `${Math.random() * 60 + 20}%`,
                    animationDelay: `${i * 0.05}s`,
                  }}
                />
              ))}
            </div>

            <div className="recording-time">
              <span className="current-time">{formatTime(recordingTime)}</span>
              <span className="separator"> / </span>
              <span className="total-time">{formatTime(10)}</span>
            </div>
          </div>
        </section>

        <section className="calibrate-section">
          <h2 className="section-title">2. Label Sound</h2>
          <div className="input-group">
            <input
              type="text"
              placeholder="e.g., Doorbell"
              value={soundLabel}
              onChange={(e) => setSoundLabel(e.target.value)}
              className="sound-input"
            />
            <span className="input-label">Sound Title</span>
          </div>
        </section>

        <section className="calibrate-section">
          <h2 className="section-title">3. Assign Color</h2>
          <div className="color-options">
            {PRESET_COLORS.map((color) => (
              <button
                key={color}
                className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                style={{ backgroundColor: color }}
                onClick={() => {
                  setSelectedColor(color);
                  setShowCustomColor(false);
                }}
              />
            ))}
            <button
              className={`custom-color-button ${showCustomColor ? 'selected' : ''}`}
              onClick={() => setShowCustomColor(true)}
            >
              Custom Color
            </button>
          </div>
          {showCustomColor && (
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="color-picker"
            />
          )}
        </section>

        <button className="save-button" onClick={handleSave}>
          Save & Sync to Library
        </button>
      </div>
    </div>
  );
}
