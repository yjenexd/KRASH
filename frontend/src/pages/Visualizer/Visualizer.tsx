import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSounds } from '../../hooks/useSounds';
import { useDetections } from '../../hooks/useDetections';
import { useSettings } from '../../hooks/useSettings';
import { useSoundDetection } from '../../hooks/useSoundDetection';
import './Visualizer.css';

interface LiveBubble {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  size: number;
  addedAt: number;
}

export default function Visualizer() {
  const navigate = useNavigate();
  const { sounds } = useSounds();
  const { detections, logDetection } = useDetections();
  const { settings } = useSettings();

  const {
    isListening,
    volume,
    lastDetection,
    startListening,
    stopListening,
  } = useSoundDetection(sounds, {
    threshold: 0.50 + 0.30 * (1 - (settings.sensitivity ?? 50) / 100), // sensitivity 0→0.80 (strict), 100→0.50 (loose)
    cooldown: 3000,
  });

  const [liveBubbles, setLiveBubbles] = useState<LiveBubble[]>([]);
  const processedRef = useRef<number>(0); // timestamp of last processed detection

  // ── React to new detections from the hook ────────────────────────────

  useEffect(() => {
    if (!lastDetection) return;
    if (lastDetection.timestamp <= processedRef.current) return;
    processedRef.current = lastDetection.timestamp;

    // Add a bubble at a random position
    const bubble: LiveBubble = {
      id: `${lastDetection.id}-${lastDetection.timestamp}`,
      name: lastDetection.name,
      color: lastDetection.color,
      x: 15 + Math.random() * 70,
      y: 15 + Math.random() * 70,
      size: 100 + lastDetection.score * 80,
      addedAt: lastDetection.timestamp,
    };
    setLiveBubbles((prev) => [...prev, bubble]);

    // Log to backend & fire notification (useDetections handles notify)
    logDetection(lastDetection.name, lastDetection.color);
  }, [lastDetection]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fade out old bubbles after 6 s ───────────────────────────────────

  useEffect(() => {
    const timer = setInterval(() => {
      const cutoff = Date.now() - 6000;
      setLiveBubbles((prev) => prev.filter((b) => b.addedAt > cutoff));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ── Helpers ──────────────────────────────────────────────────────────

  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="visualizer-page">
      <button className="calibrate-button" onClick={() => navigate('/calibrate')}>
        Calibrate New Sound
      </button>

      {/* ── Listening controls ──────────────────────────────────── */}
      <div className="listen-bar">
        <button
          className={`listen-button ${isListening ? 'active' : ''}`}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? '⏹ Stop Listening' : '🎤 Start Listening'}
        </button>

        <div className="volume-meter">
          <div
            className="volume-fill"
            style={{ width: `${Math.round(volume * 100)}%` }}
          />
        </div>

        {sounds.filter((s) => s.signature).length === 0 && (
          <span className="no-sigs-hint">
            No calibrated signatures yet — calibrate a sound first.
          </span>
        )}
      </div>

      {/* ── Echo box ───────────────────────────────────────────── */}
      <div className="visualizer-container">
        <h2 className="visualizer-title">Live Visualizer – Visual Echo Box</h2>
        <div className="echo-box">
          {liveBubbles.length === 0 && (
            <div className="echo-placeholder">
              {isListening
                ? 'Listening for sounds…'
                : 'Press Start Listening to begin'}
            </div>
          )}
          {liveBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="sound-bubble"
              style={{
                left: `${bubble.x}%`,
                top: `${bubble.y}%`,
                width: `${bubble.size}px`,
                height: `${bubble.size}px`,
                backgroundColor: bubble.color,
                boxShadow: `0 0 60px ${bubble.color}80, 0 0 100px ${bubble.color}40`,
              }}
            >
              <span className="sound-label">{bubble.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom panels ──────────────────────────────────────── */}
      <div className="bottom-panels">
        <div className="controls-panel">
          <h3 className="panel-title">Controls</h3>

          <div className="control-group">
            <label className="control-label">Sensitivity</label>
            <p className="control-description">
              Adjust how easily sounds are matched (synced from Settings).
            </p>
            <input
              type="range"
              min="0"
              max="100"
              value={settings.sensitivity ?? 50}
              className="slider"
              readOnly
            />
          </div>

          <div className="control-group">
            <div className="toggle-row">
              <div>
                <label className="control-label">Haptic Sync</label>
                <p className="control-description">
                  Sync haptic feedback for responding on your device.
                </p>
              </div>
              <button
                className={`toggle-button ${settings.hapticSync ? 'active' : ''}`}
                disabled
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div className="activity-panel">
          <h3 className="panel-title">Activity Log</h3>
          <div className="activity-list">
            {detections.length === 0 && (
              <span className="no-activity">No activity yet.</span>
            )}
            {detections.slice(0, 20).map((d) => (
              <div key={d.id} className="activity-item">
                <span className="activity-dot" style={{ backgroundColor: d.color }} />
                <span className="activity-name">{d.name} detected</span>
                <span className="activity-time">{formatRelativeTime(d.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
