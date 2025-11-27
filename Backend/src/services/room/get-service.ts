import { AppDataSource } from "../../config/database/datasource.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
import type { UserEntity } from "../../models/UserEntity.ts"
import { ApiError, APIErrors } from "../error/apiError-service.ts"
const roomRepository  = AppDataSource.getRepository(RoomEntity)
export const getRoomById = async (id:string) :Promise<Partial<RoomEntity> | ApiError> => {
    const room = await roomRepository.findOneBy({
            id    
    })
    if(!room) throw new ApiError(APIErrors.notFoundError,"Room not found !",404);
    return room;
}

export const getRooms =async()=>{
    const rooms = await roomRepository.find({
        relations: {
            owner: true,
            users: true
        }
    })
    return rooms;
}

export const getUserFromRoomById =  async(roomId:string,userId:string):Promise<Partial<UserEntity> | ApiError> =>{
    const room = await roomRepository.findOne({
        where: { id: roomId },
        relations: { users: true }
    })

    if(!room) throw new ApiError(APIErrors.notFoundError,"Room not found !",404);

    const user = room.users?.find((user) => user.id === userId)
    
    if(!user) throw new ApiError(APIErrors.notFoundError,"User not found in room !",404);
    
    return user
}