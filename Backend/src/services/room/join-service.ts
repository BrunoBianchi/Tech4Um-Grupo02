import { AppDataSource } from "../../config/database/datasource.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
import { UserEntity } from "../../models/UserEntity.ts";
import { ApiError, APIErrors } from "../error/apiError-service.ts";
import { decryptJWT } from "../jwt/decrypt-service.ts";
import { io } from "../../config/socketio/socket-instance.ts";
import { broadcastParticipants } from "../../gateways/socket-gateway.ts";
import { MessageEntity } from "../../models/MessageEntity.ts";

const roomRepository = AppDataSource.getRepository(RoomEntity)
const userRepository = AppDataSource.getRepository(UserEntity)

export const joinRoom = async (roomId:string,socketId:string) => {
    // Try to get the local socket instance first (synchronous join)
    let socket: any = io.sockets.sockets.get(socketId);

    // If not found locally, try fetching (for multi-node setups, though join might be async/delayed)
    if (!socket) {
        const sockets = await io.sockets.fetchSockets();
        socket = sockets.find(s => s.id == socketId);
    }

    if (!socket) {
        throw new ApiError(APIErrors.notFoundError, "Socket not found", 404);
    }
    const token = socket.handshake.auth?.token || socket.handshake.headers?.token || (socket.handshake as any).token;
    
    const userDecoded = await decryptJWT(token);
    
    if(!userDecoded) {
        throw new ApiError(APIErrors.authorizationError,"Invalid Session Token !",400);
    }

    const userId = (userDecoded as UserEntity).id;

    const room = await roomRepository.findOne({
        where: { id: roomId },
        relations: { users: true }
    });

    if (!room) {
        throw new ApiError(APIErrors.notFoundError, "Room not found !", 404);
    }

    const isUserInRoom = room.users?.some(u => u.id === userId);

    if (!isUserInRoom) {
        const user = await userRepository.findOneBy({ id: userId });
        if (!user) {
            throw new ApiError(APIErrors.notFoundError, "User not found !", 404);
        }

        if (!room.users) room.users = [];
        room.users.push(user);
        await roomRepository.save(room);

        // --- Welcome Message Logic ---
        const welcomeTemplates = [
            "{name} acabou de aterrissar.",
            "Eba, você conseguiu, {name}!",
            "Bem-vindo (ou vinda), {name}. Tem pizza aí?",
            "Um {name} selvagem apareceu.",
            "{name} entrou no servidor.",
            "{name} deslizou para dentro do servidor.",
            "Olha quem chegou! É o(a) {name}!",
            "{name} juntou-se ao grupo."
        ];

        const randomTemplate = welcomeTemplates[Math.floor(Math.random() * welcomeTemplates.length)];
        const welcomeText = randomTemplate?.replace("{name}", user.name);

        // Create and save the welcome message
        const messageRepo = AppDataSource.getRepository(MessageEntity);
        const welcomeMessage = new MessageEntity();
        welcomeMessage.content = welcomeText!;
        welcomeMessage.room = room;
        welcomeMessage.user = user;
        
        try {
            const savedMessage = await messageRepo.save(welcomeMessage);

            // Broadcast the message immediately
            io.to(`/room/${roomId}`).emit('receive_message', {
                id: savedMessage.id,
                text: savedMessage.content,
                user: user.name,
                userId: user.id,
                createdAt: savedMessage.createdAt
            });
        } catch (err) {
            console.error(`[Join] Failed to save welcome message:`, err);
        }
        // -----------------------------
    }

    socket.join(`/room/${roomId}`);
    socket.join(`user:${userId}`); // Join user-specific room for private messages
    
    // Small delay to ensure socket join propagates before broadcasting
    setTimeout(async () => {
        await broadcastParticipants(io, roomId);
    }, 100);
}