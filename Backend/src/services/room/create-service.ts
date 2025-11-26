import { AppDataSource } from "../../config/database/datasource.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
import {  getUserById } from "../user/get-service.ts";
import { UserEntity } from "../../models/UserEntity.ts";
import { ApiError, APIErrors } from "../error/apiError-service.ts";

const roomRepository = AppDataSource.getRepository(RoomEntity)
export const createRoom = async(room:Partial<RoomEntity>,ownerId:string):Promise<Partial<RoomEntity>> =>{
    const user = await getUserById(ownerId)
    if(!user){
        throw new ApiError(APIErrors.notFoundError,"User not found",404)
    }
    room.owner = user as UserEntity
    if (!room.users) {
        room.users = [];
    }
    room.users.push(user as UserEntity);
    
    const newRoom = roomRepository.create(room)
    await roomRepository.save(newRoom)
    return newRoom
}