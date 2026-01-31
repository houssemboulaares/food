
const sessions = new Map();

const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  do {
    code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  } while (sessions.has(code));
  return code;
};

const createSession = (hostId, hostName) => {
  const code = generateCode();
  const session = {
    code,
    hostId,
    participants: [{ id: hostId, name: hostName, isHost: true, isReady: false }],
    preferences: {}, // userId -> { budget, cuisines, dietary }
    restaurant: null,
    status: 'waiting', // waiting, deciding, result
    createdAt: Date.now(),
    location: null, // { lat, lng, address } set by host
    filters: {
        radius: 2000
    }
  };
  sessions.set(code, session);
  return session;
};

const joinSession = (code, userId, userName) => {
  const session = sessions.get(code);
  if (!session) return { error: 'Session not found' };
  
  const existing = session.participants.find(p => p.id === userId);
  if (existing) {
      existing.name = userName;
  } else {
      if (session.status !== 'waiting') return { error: 'Session already started' };
      session.participants.push({ id: userId, name: userName, isHost: false, isReady: false });
  }
  return session;
};

const getSession = (code) => sessions.get(code);

const updateParticipant = (code, userId, data) => {
    const session = sessions.get(code);
    if (!session) return null;
    const p = session.participants.find(p => p.id === userId);
    if (p) {
        Object.assign(p, data);
    }
    return session;
};

const updatePreferences = (code, userId, prefs) => {
    const session = sessions.get(code);
    if (!session) return null;
    session.preferences[userId] = prefs;
    return session;
};

const setLocation = (code, location) => {
    const session = sessions.get(code);
    if (!session) return null;
    session.location = location;
    return session;
};

const removeParticipant = (code, userId) => {
    const session = sessions.get(code);
    if (!session) return null;
    session.participants = session.participants.filter(p => p.id !== userId);
    if (session.preferences[userId]) delete session.preferences[userId];
    
    if (session.participants.length === 0) {
        sessions.delete(code);
        return null;
    }
    // If host left, assign new host
    if (!session.participants.find(p => p.isHost)) {
        session.participants[0].isHost = true;
    }
    return session;
};

module.exports = { createSession, joinSession, getSession, updateParticipant, updatePreferences, setLocation, removeParticipant };
