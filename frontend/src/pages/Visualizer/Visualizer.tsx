import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Visualizer.css';

interface DetectedSound {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  size: number;
}

interface ActivityLogItem {
  id: string;
  name: string;
  color: string;
  time: string;
}

export default function Visualizer() {
  const navigate = useNavigate();
  const [sensitivity, setSensitivity] = useState(50);
  const [hapticSync, setHapticSync] = useState(true);

  // Demo detected sounds for the visualizer
  const [detectedSounds] = useState<DetectedSound[]>([
    { id: '1', name: 'Baby Crying', color: '#3b82f6', x: 35, y: 35, size: 180 },
    { id: '2', name: 'Doorbell', color: '#f59e0b', x: 65, y: 30, size: 120 },
    { id: '3', name: 'Microwave', color: '#ef4444', x: 55, y: 65, size: 100 },
  ]);

  // Demo activity log
  const [activityLog] = useState<ActivityLogItem[]>([
    { id: '1', name: 'Baby Crying detected', color: '#3b82f6', time: '14 hours ago' },
    { id: '2', name: 'Doorbell detected', color: '#f59e0b', time: '14 hours ago' },
    { id: '3', name: 'Microwave detected', color: '#ef4444', time: '7 hours ago' },
    { id: '4', name: 'Microwave detected', color: '#ef4444', time: '3 hours ago' },
  ]);

  return (
    <div className="visualizer-page">
      <button className="calibrate-button" onClick={() => navigate('/calibrate')}>
        Calibrate New Sound
      </button>

      <div className="visualizer-container">
        <h2 className="visualizer-title">Live Visualizer - Visual Echo Box</h2>
        <div className="echo-box">
          {detectedSounds.map((sound) => (
            <div
              key={sound.id}
              className="sound-bubble"
              style={{
                left: `${sound.x}%`,
                top: `${sound.y}%`,
                width: `${sound.size}px`,
                height: `${sound.size}px`,
                backgroundColor: sound.color,
                boxShadow: `0 0 60px ${sound.color}80, 0 0 100px ${sound.color}40`,
              }}
            >
              <span className="sound-label">{sound.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bottom-panels">
        <div className="controls-panel">
          <h3 className="panel-title">Controls</h3>
          
          <div className="control-group">
            <label className="control-label">Sensitivity</label>
            <p className="control-description">Enlarge the area of the sensitivity.</p>
            <input
              type="range"
              min="0"
              max="100"
              value={sensitivity}
              onChange={(e) => setSensitivity(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="control-group">
            <div className="toggle-row">
              <div>
                <label className="control-label">Haptic Sync</label>
                <p className="control-description">Sync haptic sync for responding on your recent metal lists.</p>
              </div>
              <button
                className={`toggle-button ${hapticSync ? 'active' : ''}`}
                onClick={() => setHapticSync(!hapticSync)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          </div>
        </div>

        <div className="activity-panel">
          <h3 className="panel-title">Activity Log</h3>
          <div className="activity-list">
            {activityLog.map((item) => (
              <div key={item.id} className="activity-item">
                <span className="activity-dot" style={{ backgroundColor: item.color }} />
                <span className="activity-name">{item.name}</span>
                <span className="activity-time">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
