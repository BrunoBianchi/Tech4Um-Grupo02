import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/auth-context";
import Navbar from "./shared/navbar";
import Home from "./views/Home";
import Forum from "./views/Forum";
import { SocketProvider } from "./contexts/socket-context";
export default function App() {
  return (
    <>
      <AuthProvider>
        <SocketProvider>
            <Navbar></Navbar>
          <Routes>
            <Route path="/" element={<Home></Home>} />:
             <Route path="/forum" element={<Forum />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </>
  );
}
