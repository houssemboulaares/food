
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

export interface Participant {
    id: string;
    name: string;
    isHost: boolean;
    isReady: boolean;
}

export interface Restaurant {
    id: string | number;
    name: string;
    cuisine: string;
    price: string;
    lat: number;
    lon: number;
    rating: string;
    reviews: number;
    score?: number;
}

export interface Location {
    lat: number;
    lng: number;
}

export interface Session {
    code: string;
    participants: Participant[];
    status: 'waiting' | 'deciding' | 'result';
    restaurant: Restaurant | null;
    location: Location | null;
    preferences: Record<string, any>;
    filters: { radius: number };
    createdAt: number;
    hostId: string;
}

interface SocketContextType {
    socket: Socket | null;
    session: Session | null;
    createSession: (hostName: string) => void;
    joinSession: (code: string, userName: string) => void;
    updatePreferences: (prefs: any) => void;
    updateLocation: (location: Location) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        newSocket.on('session_created', (newSession) => {
            navigate(`/session/${newSession.code}`);
        });

        newSocket.on('joined_session', (newSession) => {
            navigate(`/session/${newSession.code}`);
        });

        newSocket.on('room:update', (updatedSession: Session) => {
            console.log('Room update received by', newSocket.id, 'code:', updatedSession.code, 'participants:', updatedSession.participants?.map(p => p.name));
            setSession(updatedSession);
            if (updatedSession.status === 'result') {
                navigate(`/session/${updatedSession.code}/results`);
            }
        });

        newSocket.on('error', (msg) => {
            alert(msg);
        });

        return () => {
            newSocket.disconnect();
        };
    }, [navigate]);

    const createSession = (hostName: string) => {
        socket?.emit('create_session', { hostName });
    };

    const joinSession = (code: string, userName: string) => {
        socket?.emit('join_session', { code, userName });
    };

    const updatePreferences = (prefs: any) => {
        if (session) {
            socket?.emit('update_preferences', { code: session.code, preferences: prefs });
        }
    };

    const updateLocation = (location: Location) => {
        if (session) {
            socket?.emit('update_location', { code: session.code, location });
        }
    }

    return (
        <SocketContext.Provider value={{ socket, session, createSession, joinSession, updatePreferences, updateLocation }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) throw new Error("useSocket must be used within SocketProvider");
    return context;
};
