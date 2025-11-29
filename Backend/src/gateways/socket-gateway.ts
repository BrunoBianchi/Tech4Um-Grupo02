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
        return;
    }
    if (room.users) {
    }

    const roomSocketIds = io.sockets.adapter.rooms.get(`/room/${roomId}`);
    const onlineUserIds = new Set();
    

    if (roomSocketIds) {
        for (const socketId of roomSocketIds) {
            const s = io.sockets.sockets.get(socketId);
            if (s) {
                if (s.data.userId) {
                    onlineUserIds.add(s.data.userId);
                } else {
                    const token = s.handshake.auth?.token || s.handshake.headers?.token || (s.handshake as any).token;
                    if(token){
                        const user = await decryptJWT(token);
                        if (user) {
                            s.data.userId = (user as UserEntity).id;
                            onlineUserIds.add((user as UserEntity).id);
                        }
                    }
                }
            }
        }
    }
    

    const participants = room.users?.map(u => ({
        id: u.id,
        name: u.name,
        active: onlineUserIds.has(u.id)
    })) || [];

    participants.sort((a, b) => (a.active === b.active ? 0 : a.active ? -1 : 1));

    io.to(`/room/${roomId}`).emit('update_participants', participants);
}

export const handleSocketEvents = (socket: Socket, io: Server) => {
    
    socket.on('send_message', async (data: { roomId: string, message: string, recipientId?: string }) => {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
        const userDecoded = await decryptJWT(token);
        if (!userDecoded) {
            return;
        }
        const userId = (userDecoded as UserEntity).id;

        const messageRepo = AppDataSource.getRepository(MessageEntity);
        const roomRepo = AppDataSource.getRepository(RoomEntity);
        const userRepo = AppDataSource.getRepository(UserEntity);

        const room = await roomRepo.findOneBy({ id: data.roomId });
        const user = await userRepo.findOneBy({ id: userId });

        if (room && user) {
            const newMessage = new MessageEntity();
            newMessage.content = data.message;
            newMessage.room = room;
            newMessage.user = user;

            let recipient: UserEntity | null = null;
            if (data.recipientId) {
                recipient = await userRepo.findOneBy({ id: data.recipientId });
                if (recipient) {
                    newMessage.destination = recipient;
                }
            }

            try {
                const savedMessage = await messageRepo.save(newMessage);

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
                    socket.emit('receive_message', messagePayload);
                    io.to(`user:${recipient.id}`).emit('receive_message', messagePayload);
                } else {
                    io.to(`/room/${data.roomId}`).emit('receive_message', messagePayload);
                }

            } catch (err) {
            }
        } 
    });

    socket.on('request_participants', async (roomId: string) => {
        await broadcastParticipants(io, roomId);
    });

    socket.on('typing_start', async (roomId: string) => {
        let userId = socket.data.userId;
        
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

        if (userId) {
            socket.to(`/room/${roomId}`).emit('user_typing', { userId, isTyping: true });
        }
    });

    socket.on('typing_stop', async (roomId: string) => {
        let userId = socket.data.userId;

        if (!userId) {
            const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
            if(token){
                const user = await decryptJWT(token);
                if (user) {
                    userId = (user as UserEntity).id;
                    socket.data.userId = userId; 
                }
            }
        }

        if (userId) {
            socket.to(`/room/${roomId}`).emit('user_typing', { userId, isTyping: false });
        }
    });

    
    socket.on('disconnecting', () => {
        const rooms = socket.rooms;
        rooms.forEach(room => {
            if (room.startsWith('/room/')) {
                const roomId = room.replace('/room/', '');
                setTimeout(() => {
                    broadcastParticipants(io, roomId);
                }, 1000);
            }
        });
    });
};
