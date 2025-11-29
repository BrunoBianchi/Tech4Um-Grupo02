import { createServer } from 'node:http';
import express from 'express';
import { io } from "./socket-instance.ts";
import * as dotenv from "dotenv"
import { verifyJWT } from '../../services/jwt/verify-service.ts';
import { decryptJWT } from '../../services/jwt/decrypt-service.ts';
import { handleSocketEvents } from '../../gateways/socket-gateway.ts';
import { UserEntity } from '../../models/UserEntity.ts';

dotenv.config({
    quiet:true,
})
const port= process.env.EXPRESS_PORT || 3000

io.on('connection',async (socket:any) => {
    const token = socket.handshake.auth.token;
    if(!token) {
        socket.disconnect();
        return;
    }
    const user = await decryptJWT(token);
    if(!user) {
        socket.disconnect();
        return;
    }
    socket.data.userId = (user as UserEntity).id;
    handleSocketEvents(socket, io);
    socket.on('join_room', async (roomId: string) => {
        if (!socket.data.userId) {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
            if (token) {
                const userDecoded = await import('../../services/jwt/decrypt-service.ts').then(mod => mod.decryptJWT(token));
                if (userDecoded && typeof userDecoded === 'object' && 'id' in userDecoded) {
                    socket.data.userId = (userDecoded as any).id;
                }
            }
        }
        socket.join(`/room/${roomId}`);
        setTimeout(() => {
            import('../../gateways/socket-gateway.ts').then(mod => {
                mod.broadcastParticipants(io, roomId);
            });
        }, 500);
    });
    socket.on('leave_room', async (roomId: string) => {
        socket.leave(`/room/${roomId}`);
        setTimeout(() => {
            import('../../gateways/socket-gateway.ts').then(mod => {
                mod.broadcastParticipants(io, roomId);
            });
        }, 500);
    });
});

export const initializeSocketServer = (app:express.Express)=>{
    const server = createServer(app);
    io.attach(server);
    server.listen(port,()=>{
        console.log(`Server Listening at port ${port}`)
    })
}

