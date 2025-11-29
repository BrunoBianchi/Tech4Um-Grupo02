import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import Navbar from "./shared/navbar";
import Home from "./views/Home";
import Forum from "./views/Forum";
import ChatRoom from "./views/ChatRoom";
import { SocketProvider } from "./contexts/socket-context";
import { RoomProvider } from "./contexts/rooms-context";
export default function App() {
  return (
    <>
      <AuthProvider>
        <SocketProvider>
          <RoomProvider>
            <Navbar></Navbar>
            <Routes>
              <Route path="/" element={<Forum />} />
              <Route path="/room/:roomId" element={<ChatRoom />} />
            </Routes>
          </RoomProvider>
        </SocketProvider>
      </AuthProvider>
    </>
  );
}
