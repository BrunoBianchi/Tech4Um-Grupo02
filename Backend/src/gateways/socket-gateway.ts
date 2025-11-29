import { Server, Socket } from 'socket.io';
import { AppDataSource } from '../config/database/datasource.ts';
import { MessageEntity } from '../models/MessageEntity.ts';
import { RoomEntity } from '../models/RoomEntity.ts';
import { UserEntity } from '../models/UserEntity.ts';
import { decryptJWT } from '../services/jwt/decrypt-service.ts';

export const broadcastParticipants = async (io: Server, roomId: string) => {
    const roomRepo = AppDataSource.getRepository(RoomEntity);
    const room = await roomRepo.findOne({
        where: { id: roomId },
        relations: { users: true }
    });

    if (!room) {
        console.log(`[Broadcast] Room ${roomId} not found in DB`);
        return;
    }
    if (room.users) {
        console.log(`[Broadcast] DB Users: ${room.users.map(u => u.name).join(', ')}`);
    }

    // Use local sockets lookup for reliability in single-server setup
    const roomSocketIds = io.sockets.adapter.rooms.get(`/room/${roomId}`);
    const onlineUserIds = new Set();
    
    console.log(`[Broadcast] Room: ${roomId}, Socket IDs:`, roomSocketIds ? Array.from(roomSocketIds) : 'None');

    if (roomSocketIds) {
        for (const socketId of roomSocketIds) {
            const s = io.sockets.sockets.get(socketId);
            if (s) {
                if (s.data.userId) {
                    onlineUserIds.add(s.data.userId);
                } else {
                    // Fallback
                    const token = s.handshake.auth?.token || s.handshake.headers?.token || (s.handshake as any).token;
                    if(token){
                        const user = await decryptJWT(token);
                        if (user) {
                            // Cache it for next time
                            s.data.userId = (user as UserEntity).id;
                            onlineUserIds.add((user as UserEntity).id);
                        }
                    }
                }
            }
        }
    }
    
    console.log(`[Broadcast] Online User IDs:`, Array.from(onlineUserIds));

    const participants = room.users?.map(u => ({
        id: u.id,
        name: u.name,
        active: onlineUserIds.has(u.id)
    })) || [];

    // Sort: Online first
    participants.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

    io.to(`/room/${roomId}`).emit('update_participants', participants);
}

export const handleSocketEvents = (socket: Socket, io: Server) => {
    
    socket.on('send_message', async (data: { roomId: string, message: string, recipientId?: string }) => {
        console.log(`[Socket] send_message received:`, data);
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
        const userDecoded = await decryptJWT(token);
        if (!userDecoded) {
            console.log(`[Socket] send_message failed: Invalid token`);
            return;
        }
        const userId = (userDecoded as UserEntity).id;
        console.log(`[Socket] User ID: ${userId}`);

        const messageRepo = AppDataSource.getRepository(MessageEntity);
        const roomRepo = AppDataSource.getRepository(RoomEntity);
        const userRepo = AppDataSource.getRepository(UserEntity);

        const room = await roomRepo.findOneBy({ id: data.roomId });
        const user = await userRepo.findOneBy({ id: userId });

        if (room && user) {
            console.log(`[Socket] Room and User found. Saving message...`);
            const newMessage = new MessageEntity();
            newMessage.content = data.message;
            newMessage.room = room;
            newMessage.user = user;

            let recipient: UserEntity | null = null;
            if (data.recipientId) {
                recipient = await userRepo.findOneBy({ id: data.recipientId });
                if (recipient) {
                    newMessage.destination = recipient;
                    console.log(`[Socket] Private message to: ${recipient.name}`);
                }
            }

            try {
                const savedMessage = await messageRepo.save(newMessage);
                console.log(`[Socket] Message saved:`, savedMessage.id, 'CreatedAt:', savedMessage.createdAt);

                const messagePayload = {
                    id: savedMessage.id,
                    text: savedMessage.content,
                    user: user.name,
                    userId: user.id,
                    createdAt: savedMessage.createdAt,
                    isPrivate: !!recipient,
                    destinationName: recipient?.name
                };

                if (recipient) {
                    // Send to sender
                    socket.emit('receive_message', messagePayload);
                    // Send to recipient
                    io.to(`user:${recipient.id}`).emit('receive_message', messagePayload);
                } else {
                    // Broadcast to room
                    io.to(`/room/${data.roomId}`).emit('receive_message', messagePayload);
                }

            } catch (err) {
                console.error(`[Socket] Error saving message:`, err);
            }
        } else {
            console.log(`[Socket] Room (${!!room}) or User (${!!user}) not found.`);
        }
    });

    socket.on('request_participants', async (roomId: string) => {
        await broadcastParticipants(io, roomId);
    });

    socket.on('typing_start', async (roomId: string) => {
        console.log(socket.data)
        let userId = socket.data.userId;
        
        // Fallback if userId is missing in socket.data
        if (!userId) {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
            if(token){
                const user = await decryptJWT(token);
                if (user) {
                    userId = (user as UserEntity).id;
                    socket.data.userId = userId; // Cache it
                }
            }
        }

        console.log(`[Typing Start] User: ${userId}, Room: ${roomId}`);
        if (userId) {
            socket.to(`/room/${roomId}`).emit('user_typing', { userId, isTyping: true });
        }
    });

    socket.on('typing_stop', async (roomId: string) => {
        let userId = socket.data.userId;

        // Fallback if userId is missing in socket.data
        if (!userId) {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
            if(token){
                const user = await decryptJWT(token);
                if (user) {
                    userId = (user as UserEntity).id;
                    socket.data.userId = userId; // Cache it
                }
            }
        }

        console.log(`[Typing Stop] User: ${userId}, Room: ${roomId}`);
        if (userId) {
            socket.to(`/room/${roomId}`).emit('user_typing', { userId, isTyping: false });
        }
    });
    
    // When a user disconnects, we might want to update participants in all rooms they were in.
    // However, tracking that efficiently requires more state. 
    // For now, we can rely on the client polling or re-fetching if needed, 
    // OR we can try to find which rooms this socket was in.
    // Socket.IO leaves rooms automatically, so `io.in(roomId).fetchSockets()` will be accurate next time it's called.
    // To make it reactive, we'd need to know which rooms to update.
    
    socket.on('disconnecting', () => {
        const rooms = socket.rooms;
        rooms.forEach(room => {
            if (room.startsWith('/room/')) {
                const roomId = room.replace('/room/', '');
                // We need to wait a bit for the socket to actually leave, or just trigger it.
                // Actually, `disconnecting` happens BEFORE leaving.
                // So we can trigger an update shortly after.
                setTimeout(() => {
                    broadcastParticipants(io, roomId);
                }, 1000);
            }
        });
    });
};
