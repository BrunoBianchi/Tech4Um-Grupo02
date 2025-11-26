import { createContext, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../hooks/auth-hook";

interface SocketContextData {
  isConnected: boolean;
  socket: Socket | null;
  connect(token: string): void;
  disconnect(): void;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { signed } = useAuth();

  function connect(token: string) {
    if (socket) return; 

    const newSocket = io("http://localhost:3000", {
      auth: {
        token: token,
      },
      autoConnect: false,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
    newSocket.connect();
  }

  function disconnect() {
    if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }

  useEffect(() => {
    if (signed && !isConnected && !socket) {
      const token = localStorage.getItem('@App:token');
      if (token) {
        connect(token);
      }
    } else if (!signed && socket) {
      disconnect();
    }
  }, [signed, isConnected, socket]);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        connect,
        disconnect,
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
export default SocketContext;