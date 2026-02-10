import { useNotifications } from './NotificationContext';
import './NotificationToast.css';

export default function NotificationToast() {
  const { notifications, dismiss } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notif) => (
        <div key={notif.id} className="notification-toast">
          <div className="notification-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </div>
          <div className="notification-body">
            <p className="notification-title">SonicSight</p>
            <p className="notification-message">
              "<span className="notification-sound">{notif.soundName}</span>" detected
            </p>
            <p className="notification-time">{notif.timestamp}</p>
          </div>
          <button className="notification-close" onClick={() => dismiss(notif.id)}>
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
