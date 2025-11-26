import { useAuth } from "../hooks/auth-hook";
import { useSocket } from "../hooks/socket-hook";

export default function Home() {
  const { signed } = useAuth();
  const { isConnected,socket } = useSocket();
  return (
    <>
    </>
  );
}
