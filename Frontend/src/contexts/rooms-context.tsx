import { createContext, useState } from "react";
import { api } from "../services/axios";
import { useSocket } from "../hooks/socket-hook";
interface RoomContextData {
  join(room: string,socketId:string): Promise<void>;
  getRooms(): Promise<void>;
  create(name: string, description?: string, tags?: string[]): Promise<void>;
  room: object | null;
  rooms: object[] | null;
}

const RoomContext = createContext<RoomContextData>({} as RoomContextData);
export const RoomProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [room, setRoom] = useState(null);
  const [rooms, setRooms] = useState(null);
  const {socket} = useSocket()
  
  async function join(room: string,socketId:string) {
    const storagedToken = localStorage.getItem("@App:token");
    try {
      const response = await api.post(`/room/join/${room}`, 
        { socketId },
        {
          headers: {
            authorization: `Bearer ${storagedToken}`,
          },
        }
      );
      setRoom(response.data);
    } catch (err) {
      throw err;
    }
  }
  async function create(name: string, description?: string, tags?: string[]) {
    const storagedToken = localStorage.getItem("@App:token");
    try {
      const response = await api.post(`/room`, 
        { name, description, tags },
        {
          headers: {
            authorization: `Bearer ${storagedToken}`,
          },
        }
      );
      setRoom(response.data.room);
    } catch (err) {
      throw err;
    }
  }
  async function getRooms() {
     const storagedToken = localStorage.getItem("@App:token");
     try {
      const response = await api.get(`/room/rooms`, {
        headers: {
          authorization: `Bearer ${storagedToken}`,
        },
      });
      setRooms(response.data.rooms);
    } catch (err) {
      throw err;
    }   
  }
  return (
    <>
      <RoomContext.Provider
        value={{ room, join, getRooms: getRooms, create: create, rooms }}
      >
        {children}
      </RoomContext.Provider>
    </>
  );
};

export default RoomContext;
