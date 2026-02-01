import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Session, Location } from "../types";

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

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket] = useState<Socket>(() => {
    console.log(
      "[DEBUG] SocketContext: Initializing socket instance (ONCE per lifecycle)",
    );
    return io("http://localhost:3000");
  });
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    console.log("[DEBUG] SocketContext: Effect mounted");

    const onConnect = () => {
      console.log("[DEBUG] Socket: Connected", socket.id);
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log("[DEBUG] Socket: Disconnected");
      setIsConnected(false);
    };

    const onSessionCreated = (newSession: Session) => {
      console.log("[DEBUG] Socket: session_created received", newSession);
      setSession(newSession);
    };

    const onJoinedSession = (joinedSession: Session) => {
      console.log("[DEBUG] Socket: joined_session received", joinedSession);
      setSession(joinedSession);
    };

    const onRoomUpdate = (updatedSession: Session) => {
      console.log("[DEBUG] Socket: room:update received", updatedSession);
      setSession(updatedSession);
    };

    const onError = (msg: string) => {
      console.error("[DEBUG] Socket: Error received", msg);
      alert(msg);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("session_created", onSessionCreated);
    socket.on("joined_session", onJoinedSession);
    socket.on("room:update", onRoomUpdate);
    socket.on("error", onError);

    // Check immediate status in case we missed the event
    if (socket.connected) {
      console.log("[DEBUG] SocketContext: Already connected on mount");
      setTimeout(() => {
        setIsConnected(true);
      }, 0);
    }

    return () => {
      console.log("[DEBUG] SocketContext: Cleanup (listeners removed)");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("session_created", onSessionCreated);
      socket.off("joined_session", onJoinedSession);
      socket.off("room:update", onRoomUpdate);
      socket.off("error", onError);
    };
  }, [socket]); // Removed navigate from dependencies

  const createSession = (hostName: string) => {
    console.log("[DEBUG] createSession called with:", hostName);
    if (!isConnected) {
      console.warn(
        "[DEBUG] createSession: Socket not connected! Aborting emit.",
      );
      alert("Connection to server lost. Please wait...");
      return;
    }
    console.log("[DEBUG] createSession: Emitting create_session");
    socket.emit("create_session", { hostName });
  };

  const joinSession = (code: string, userName: string) => {
    console.log("[DEBUG] joinSession called with:", { code, userName });
    if (!isConnected) {
      console.warn("[DEBUG] joinSession: Socket not connected! Aborting emit.");
      alert("Connection to server lost. Please wait...");
      return;
    }
    console.log("[DEBUG] joinSession: Emitting join_session");
    socket.emit("join_session", { code, userName });
  };

  const updatePreferences = (prefs: Record<string, unknown>) => {
    if (session) {
      socket.emit("update_preferences", {
        code: session.code,
        preferences: prefs,
      });
    }
  };

  const updateLocation = (location: Location) => {
    if (session) {
      socket?.emit("update_location", { code: session.code, location });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        session,
        createSession,
        joinSession,
        updatePreferences,
        updateLocation,
      }}
    >
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
