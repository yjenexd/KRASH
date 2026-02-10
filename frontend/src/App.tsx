import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Visualizer from './components/Visualizer';
import CalibrateSound from './components/CalibrateSound';
import SoundLibrary from './components/SoundLibrary';
import History from './components/History';
import Settings from './components/Settings';
import './App.css';

function App() {
  return (
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
    </Router>
  );
}

export default App;
