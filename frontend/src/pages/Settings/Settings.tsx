import { useState, useEffect } from 'react';
import { Bell, Vibrate, Moon, Volume2, Shield, HelpCircle } from 'lucide-react';
import { useSettings } from '../../hooks/useSettings';
import './Settings.css';

interface SettingToggle {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  enabled: boolean;
}

export default function Settings() {
  const { settings: apiSettings, loading, error, updateSettings } = useSettings();

  const buildUiSettings = (): SettingToggle[] => [
    {
      id: 'notifications',
      label: 'Push Notifications',
      description: 'Receive alerts when sounds are detected',
      icon: <Bell size={20} />,
      enabled: apiSettings.notifications,
    },
    {
      id: 'haptic',
      label: 'Haptic Feedback',
      description: 'Vibrate device on sound detection',
      icon: <Vibrate size={20} />,
      enabled: apiSettings.hapticSync,
    },
    {
      id: 'darkMode',
      label: 'Dark Mode',
      description: 'Use dark theme throughout the app',
      icon: <Moon size={20} />,
      enabled: apiSettings.darkMode,
    },
    {
      id: 'soundAlerts',
      label: 'Sound Alerts',
      description: 'Play audio alerts on detection',
      icon: <Volume2 size={20} />,
      enabled: apiSettings.soundAlerts,
    },
  ];

  const [uiSettings, setUiSettings] = useState<SettingToggle[]>(buildUiSettings());

  // Sync UI state when API settings load/change
  useEffect(() => {
    setUiSettings(buildUiSettings());
  }, [apiSettings]);

  // Apply dark/light theme to the document
  useEffect(() => {
    const isDark = apiSettings.darkMode;
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [apiSettings.darkMode]);

  const toggleSetting = async (id: string) => {
    const updatedSettings = uiSettings.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    );
    setUiSettings(updatedSettings);

    // Map UI ids back to API field names and persist
    await updateSettings({
      notifications: updatedSettings.find(s => s.id === 'notifications')?.enabled,
      hapticSync: updatedSettings.find(s => s.id === 'haptic')?.enabled,
      soundAlerts: updatedSettings.find(s => s.id === 'soundAlerts')?.enabled,
      darkMode: updatedSettings.find(s => s.id === 'darkMode')?.enabled,
    });
  };

  return (
    <div className="settings-page">
      <h1 className="settings-title">Settings</h1>

      {loading && <p className="settings-loading">Loading settings...</p>}
      {error && <p className="settings-error">{error}</p>}

      <section className="settings-section">
        <h2 className="section-title">Preferences</h2>
        <div className="settings-list">
          {uiSettings.map((setting) => (
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
