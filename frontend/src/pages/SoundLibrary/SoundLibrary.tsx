import { useEffect } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSounds } from '../../hooks/useSounds';
import { getRelativeTime } from '../../utils/dateUtils';
import './SoundLibrary.css';

export default function SoundLibrary() {
  const navigate = useNavigate();
  const { sounds, loading, error, fetchSounds, deleteSound } = useSounds();

  useEffect(() => {
    fetchSounds();
  }, []);

  return (
    <div className="library-page">
      <div className="library-header">
        <h1 className="library-title">Sound Library</h1>
        <button className="add-sound-btn" onClick={() => navigate('/calibrate')}>
          <Plus size={20} />
          <span>Add New Sound</span>
        </button>
      </div>

      {loading && <div className="loading-message">Loading sounds...</div>}
      {error && <div className="error-message">{error}</div>}

      {!loading && sounds.length === 0 && (
        <div className="empty-message">
          <p>No sounds yet. Add your first sound!</p>
        </div>
      )}

      {!loading && sounds.length > 0 && (
        <div className="sounds-grid">
          {sounds.map((sound) => (
            <div key={sound.id} className="sound-card">
              <div className="sound-color" style={{ backgroundColor: sound.color }} />
              <div className="sound-info">
                <h3 className="sound-name">{sound.name}</h3>
                <p className="sound-date">Added {getRelativeTime(sound.createdAt)}</p>
              </div>
              <div className="sound-actions">
                <button className="action-btn edit">
                  <Edit2 size={16} />
                </button>
                <button 
                  className="action-btn delete"
                  onClick={() => deleteSound(sound.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
