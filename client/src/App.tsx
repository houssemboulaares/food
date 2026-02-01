
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { SocketProvider, useSocket } from './context/SocketContext';
import Landing from './pages/Landing';
import Preferences from './pages/Preferences';
import WaitingRoom from './pages/WaitingRoom';
import Results from './pages/Results';
import type { Session } from './types';

function SocketNavigation() {
  const { socket } = useSocket();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return;

    const onSessionCreated = (newSession: Session) => {
      console.log('[DEBUG] SocketNavigation: Navigating to session', newSession.code);
      navigate(`/session/${newSession.code}`);
    };

    const onJoinedSession = (joinedSession: Session) => {
      console.log('[DEBUG] SocketNavigation: Navigating to session', joinedSession.code);
      navigate(`/session/${joinedSession.code}`);
    };

    const onRoomUpdate = (updatedSession: Session) => {
      if (updatedSession.status === 'result') {
        console.log('[DEBUG] SocketNavigation: Navigating to results');
        navigate(`/session/${updatedSession.code}/results`);
      }
    };

    socket.on('session_created', onSessionCreated);
    socket.on('joined_session', onJoinedSession);
    socket.on('room:update', onRoomUpdate);

    return () => {
      socket.off('session_created', onSessionCreated);
      socket.off('joined_session', onJoinedSession);
      socket.off('room:update', onRoomUpdate);
    };
  }, [socket, navigate]);

  return null;
}

function AppContent() {
  return (
    <>
      <SocketNavigation />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/session/:id" element={<WaitingRoom />} />
        {/* Fallback route for legacy/lobby links */}
        <Route path="/lobby/:id" element={<WaitingRoom />} />
        <Route path="/session/:id/preferences" element={<Preferences />} />
        <Route path="/session/:id/results" element={<Results />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <SocketProvider>
      <Router>
        <AppContent />
      </Router>
    </SocketProvider>
  );
}

export default App;
