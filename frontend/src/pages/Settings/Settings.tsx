import { useState } from 'react';
import { Bell, Vibrate, Moon, Volume2, Shield, HelpCircle } from 'lucide-react';
import './Settings.css';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingToggle[]>([
    {
      id: 'notifications',
      label: 'Push Notifications',
      description: 'Receive alerts when sounds are detected',
      icon: <Bell size={20} />,
      enabled: true,
    },
    {
      id: 'haptic',
      label: 'Haptic Feedback',
      description: 'Vibrate device on sound detection',
      icon: <Vibrate size={20} />,
      enabled: true,
    },
    {
      id: 'darkMode',
      label: 'Dark Mode',
      description: 'Use dark theme throughout the app',
      icon: <Moon size={20} />,
      enabled: true,
    },
    {
      id: 'soundAlerts',
      label: 'Sound Alerts',
      description: 'Play audio alerts on detection',
      icon: <Volume2 size={20} />,
      enabled: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(settings.map(s => 
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      <section className="settings-section">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-list">
          {settings.map((setting) => (
            <div key={setting.id} className="setting-item">
              <div className="setting-icon">{setting.icon}</div>
              <div className="setting-info">
                <h3 className="setting-label">{setting.label}</h3>
                <p className="setting-description">{setting.description}</p>
              </div>
              <button
                className={`toggle-button ${setting.enabled ? 'active' : ''}`}
                onClick={() => toggleSetting(setting.id)}
              >
                <span className="toggle-knob" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="settings-section">
        <h2 className="section-title">About</h2>
        <div className="settings-list">
          <div className="setting-item clickable">
            <div className="setting-icon"><Shield size={20} /></div>
            <div className="setting-info">
              <h3 className="setting-label">Privacy Policy</h3>
              <p className="setting-description">View our privacy policy</p>
            </div>
          </div>
          <div className="setting-item clickable">
            <div className="setting-icon"><HelpCircle size={20} /></div>
            <div className="setting-info">
              <h3 className="setting-label">Help & Support</h3>
              <p className="setting-description">Get help with SonicSight</p>
            </div>
          </div>
        </div>
      </section>

      <div className="app-version">
        <p>SonicSight v1.0.0</p>
      </div>
    </div>
  );
}
