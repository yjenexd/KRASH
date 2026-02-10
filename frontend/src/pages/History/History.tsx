import { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import './History.css';

interface HistoryItem {
  id: string;
  name: string;
  color: string;
  timestamp: string;
  date: string;
}

export default function History() {
  const [historyItems] = useState<HistoryItem[]>([
    { id: '1', name: 'Baby Crying detected', color: '#3b82f6', timestamp: '10:32 AM', date: 'Today' },
    { id: '2', name: 'Doorbell detected', color: '#f59e0b', timestamp: '9:15 AM', date: 'Today' },
    { id: '3', name: 'Microwave detected', color: '#ef4444', timestamp: '8:45 AM', date: 'Today' },
    { id: '4', name: 'Microwave detected', color: '#ef4444', timestamp: '6:30 PM', date: 'Yesterday' },
    { id: '5', name: 'Baby Crying detected', color: '#3b82f6', timestamp: '2:15 PM', date: 'Yesterday' },
    { id: '6', name: 'Doorbell detected', color: '#f59e0b', timestamp: '11:00 AM', date: 'Yesterday' },
    { id: '7', name: 'Fire Alarm detected', color: '#22c55e', timestamp: '9:45 AM', date: '2 days ago' },
  ]);

  const groupedHistory = historyItems.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {} as Record<string, HistoryItem[]>);

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

      <div className="history-list">
        {Object.entries(groupedHistory).map(([date, items]) => (
          <div key={date} className="history-group">
            <h2 className="group-date">{date}</h2>
            <div className="group-items">
              {items.map((item) => (
                <div key={item.id} className="history-item">
                  <span className="item-dot" style={{ backgroundColor: item.color }} />
                  <span className="item-name">{item.name}</span>
                  <span className="item-time">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
