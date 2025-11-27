import { AppDataSource } from "../../config/database/datasource.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
import { UserEntity } from "../../models/UserEntity.ts";
import { ApiError, APIErrors } from "../error/apiError-service.ts";
import { decryptJWT } from "../jwt/decrypt-service.ts";
import { io } from "../../config/socketio/socket-instance.ts";

const roomRepository = AppDataSource.getRepository(RoomEntity)
const userRepository = AppDataSource.getRepository(UserEntity)

export const joinRoom = async (roomId:string,socketId:string) => {
    const sockets = await io.sockets.fetchSockets();
    const socket = sockets.find(s =>{
        return s.id == socketId
    });

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
    }

    socket.join(`/room/${roomId}`);
}