import { useContext } from "react";

import RoomContext from "../contexts/rooms-context";
export function useRoom(){
 const context = useContext(RoomContext);

 return context;
}

