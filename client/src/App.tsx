
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import Landing from './pages/Landing';
import Preferences from './pages/Preferences';
import WaitingRoom from './pages/WaitingRoom';
import Results from './pages/Results';

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/session/:id" element={<WaitingRoom />} />
      <Route path="/session/:id/preferences" element={<Preferences />} />
      <Route path="/session/:id/results" element={<Results />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <SocketProvider>
        <AppContent />
      </SocketProvider>
    </Router>
  );
}

export default App;
