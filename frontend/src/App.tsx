import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Visualizer from './pages/Visualizer/Visualizer';
import CalibrateSound from './pages/CalibrateSound/CalibrateSound';
import SoundLibrary from './pages/SoundLibrary/SoundLibrary';
import History from './pages/History/History';
import Settings from './pages/Settings/Settings';
import { NotificationProvider } from './components/Notifications/NotificationContext';
import NotificationToast from './components/Notifications/NotificationToast';
import './App.css';

function App() {
  return (
    <NotificationProvider>
      <Router>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Visualizer />} />
              <Route path="/calibrate" element={<CalibrateSound />} />
              <Route path="/sound-library" element={<SoundLibrary />} />
              <Route path="/history" element={<History />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
        <NotificationToast />
      </Router>
    </NotificationProvider>
  );
}

export default App;
