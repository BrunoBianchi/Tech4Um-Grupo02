import { createContext, useState } from "react";
import { api } from "../services/axios";
import { useSocket } from "../hooks/socket-hook";
import { getCookie } from "../utils/cookie";

interface RoomContextData {
  join(room: string, socketId: string): Promise<void>;
  getRooms(
    start?: number,
    end?: number,
    tag?: string,
    orderBy?: 'date' | 'popularity' | 'owner',
    orderDirection?: 'ASC' | 'DESC',
    ownerId?: string
  ): Promise<number>;
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
  const { socket } = useSocket()

  async function join(room: string, socketId: string) {
    const storagedToken = getCookie("@App:token");
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
    const storagedToken = getCookie("@App:token");
    const storagedUser = getCookie("@App:user");

    if (!storagedUser) throw new Error("User not found");
    const user = JSON.parse(storagedUser);

    try {
      const response = await api.post(`/room`,
        { name, description, tags, owner: user.id },
        {
          headers: {
            authorization: `Bearer ${storagedToken}`,
          },
        }
      );
      // Refresh rooms list after creation
      await getRooms(0, 6);
      setRoom(response.data.room);
      return response.data.room;
    } catch (err) {
      throw err;
    }
  }

  async function getRooms(
    start: number = 0,
    end: number = 6,
    tag?: string,
    orderBy?: 'date' | 'popularity' | 'owner',
    orderDirection?: 'ASC' | 'DESC',
    ownerId?: string
  ) {
    const storagedToken = getCookie("@App:token");
    try {
      const response = await api.get(`/room/rooms`, {
        params: { start, end, tag, orderBy, orderDirection, ownerId },
        headers: {
          authorization: `Bearer ${storagedToken}`,
        },
      });

      if (start === 0) {
        setRooms(response.data.rooms);
      } else {
        setRooms((prev: any) => {
          if (!prev) return response.data.rooms;
          // Avoid duplicates if any
          const newRooms = response.data.rooms.filter((newRoom: any) =>
            !prev.some((existingRoom: any) => existingRoom.id === newRoom.id)
          );
          return [...prev, ...newRooms];
        });
      }
      return response.data.rooms.length;
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
