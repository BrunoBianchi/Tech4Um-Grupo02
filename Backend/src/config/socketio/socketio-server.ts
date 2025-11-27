import { createServer } from 'node:http';
import express from 'express';
import { io } from "./socket-instance.ts";
import * as dotenv from "dotenv"
import { verifyJWT } from '../../services/jwt/verify-service.ts';

dotenv.config({
    quiet:true,
})
const port= process.env.EXPRESS_PORT || 3000

io.on('connection',async (socket:any) => {
    const token = socket.handshake.auth.token;
    if(!token || !await verifyJWT(token)) {socket.disconnect()}
});

export const initializeSocketServer = (app:express.Express)=>{
    const server = createServer(app);
    io.attach(server);
    server.listen(port,()=>{
        console.log(`Server Listening at port ${port}`)
    })
}

