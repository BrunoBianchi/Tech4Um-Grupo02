import { useContext } from "react";
import SocketContext from "../contexts/socket-context";
export function useSocket(){
 const context = useContext(SocketContext);

 return context;
}

