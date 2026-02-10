import { useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './SoundLibrary.css';

interface Sound {
  id: string;
  name: string;
  color: string;
  createdAt: string;
}

export default function SoundLibrary() {
  const navigate = useNavigate();
  const [sounds] = useState<Sound[]>([
    { id: '1', name: 'Baby Crying', color: '#3b82f6', createdAt: '2 days ago' },
    { id: '2', name: 'Doorbell', color: '#f59e0b', createdAt: '5 days ago' },
    { id: '3', name: 'Microwave', color: '#ef4444', createdAt: '1 week ago' },
    { id: '4', name: 'Fire Alarm', color: '#22c55e', createdAt: '2 weeks ago' },
  ]);

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title">Sound Library</h1>
        <button className="add-sound-btn" onClick={() => navigate('/calibrate')}>
          <Plus size={20} />
          <span>Add New Sound</span>
        </button>
      </div>

      <div className="sounds-grid">
        {sounds.map((sound) => (
          <div key={sound.id} className="sound-card">
            <div className="sound-color" style={{ backgroundColor: sound.color }} />
            <div className="sound-info">
              <h3 className="sound-name">{sound.name}</h3>
              <p className="sound-date">Added {sound.createdAt}</p>
            </div>
            <div className="sound-actions">
              <button className="action-btn edit">
                <Edit2 size={16} />
              </button>
              <button className="action-btn delete">
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
