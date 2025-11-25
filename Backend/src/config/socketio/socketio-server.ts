import { serverExpress as app } from '../express/express-server.ts';
import { createServer } from 'node:http';
import express from 'express';
import {Server} from "socket.io"
const server = createServer(app);
const io = new Server(server)
import * as dotenv from "dotenv"
dotenv.config({
    quiet:true,
})
const port= process.env.EXPRESS_PORT || 3000

io.on('connection', (socket) => {
  console.log(socket);
});

export const initializeSocketServer = (app:express.Express)=>{
    server.listen(port,()=>{
        console.log(`Server Listening at port ${port}`)
    })
}