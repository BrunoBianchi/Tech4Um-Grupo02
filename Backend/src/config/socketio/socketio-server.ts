import { serverExpress as app } from '../express/express-server.ts';
import { createServer } from 'node:http';
import express from 'express';
import {Server} from "socket.io"
const server = createServer(app);
const io = new Server(server,{cors: { origin: "*" }})
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
    server.listen(port,()=>{
        console.log(`Server Listening at port ${port}`)
    })
}