
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import type { Session, Location } from '../types';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    session: Session | null;
    createSession: (hostName: string) => void;
    joinSession: (code: string, userName: string) => void;
    updatePreferences: (prefs: Record<string, unknown>) => void;
    updateLocation: (location: Location) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket] = useState<Socket>(() => io('http://localhost:3000'));
    const [isConnected, setIsConnected] = useState(socket.connected);
    const [session, setSession] = useState<Session | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (socket.disconnected) {
            socket.connect();
        }

        const onConnect = () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);

        socket.on('session_created', (newSession) => {
            navigate(`/session/${newSession.code}`);
        });

        socket.on('joined_session', (newSession) => {
            navigate(`/session/${newSession.code}`);
        });

        socket.on('room:update', (updatedSession: Session) => {
            console.log('Room update received by', socket.id, 'code:', updatedSession.code, 'participants:', updatedSession.participants?.map(p => p.name));
            setSession(updatedSession);
            if (updatedSession.status === 'result') {
                navigate(`/session/${updatedSession.code}/results`);
            }
        });

        socket.on('error', (msg) => {
            alert(msg);
        });

        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.removeAllListeners();
            socket.disconnect();
        };
    }, [socket, navigate]);

    const createSession = (hostName: string) => {
        if (!isConnected) {
            console.warn('Cannot create session: socket not connected');
            return;
        }
        socket.emit('create_session', { hostName });
    };

    const joinSession = (code: string, userName: string) => {
        if (!isConnected) {
            console.warn('Cannot join session: socket not connected');
            return;
        }
        socket.emit('join_session', { code, userName });
    };

    const updatePreferences = (prefs: Record<string, unknown>) => {
        if (session) {
            socket.emit('update_preferences', { code: session.code, preferences: prefs });
        }
    };

    const updateLocation = (location: Location) => {
        if (session) {
            socket?.emit('update_location', { code: session.code, location });
        }
    }

    return (
        <SocketContext.Provider value={{ socket, isConnected, session, createSession, joinSession, updatePreferences, updateLocation }}>
            {children}
        </SocketContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used within SocketProvider");
    return context;
};
