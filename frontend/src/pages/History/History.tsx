import { Calendar, Filter } from 'lucide-react';
import { useDetections } from '../../hooks/useDetections';
import './History.css';

interface Detection {
  id: string;
  name: string;
  color: string;
  timestamp: string;
}

export default function History() {
  const { detections, loading, error } = useDetections();

  // Group detections by date
  const groupByDate = (items: Detection[]) => {
    return items.reduce((acc, item) => {
      const date = new Date(item.timestamp).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(item);
      return acc;
    }, {} as Record<string, Detection[]>);
  };

  const groupedHistory = groupByDate(detections);

  return (
    <div className="history-page">
      <div className="history-header">
        <h1 className="history-title">Detection History</h1>
        <div className="history-actions">
          <button className="filter-btn">
            <Filter size={18} />
            <span>Filter</span>
          </button>
          <button className="date-btn">
            <Calendar size={18} />
            <span>Date Range</span>
          </button>
        </div>
      </div>

      {loading && (
        <div className="history-state">
          <p className="state-message">Loading detection history...</p>
        </div>
      )}

      {error && (
        <div className="history-state error">
          <p className="state-message">Error loading history: {error}</p>
        </div>
      )}

      {!loading && !error && detections.length === 0 && (
        <div className="history-state empty">
          <p className="state-message">No detections yet. Start recording to see history here.</p>
        </div>
      )}

      {!loading && !error && detections.length > 0 && (
        <div className="history-list">
          {Object.entries(groupedHistory).map(([date, items]) => (
            <div key={date} className="history-group">
              <h2 className="group-date">{date}</h2>
              <div className="group-items">
                {items.map((item: Detection) => (
                  <div key={item.id} className="history-item">
                    <span className="item-dot" style={{ backgroundColor: item.color }} />
                    <span className="item-name">{item.name}</span>
                    <span className="item-time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
