import { AppDataSource } from "../../config/database/datasource.ts"
import { MessageEntity } from "../../models/MessageEntity.ts"
import { RoomEntity } from "../../models/RoomEntity.ts"
import type { UserEntity } from "../../models/UserEntity.ts"
import { ApiError, APIErrors } from "../error/apiError-service.ts"
import { IsNull, Not } from "typeorm";

const roomRepository  = AppDataSource.getRepository(RoomEntity)

export const getRoomById = async (id:string) :Promise<Partial<RoomEntity> | ApiError> => {
    const room = await roomRepository.findOneBy({
            id    
    })
    if(!room) throw new ApiError(APIErrors.notFoundError,"Room not found !",404);
    return room;
}

export const getRoomMessages = async (req: any, res: any) => {
    const roomId = req.params.roomId as string;
    const userId = res.locals.user?.id;

    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });
    
    const messageRepo = AppDataSource.getRepository(MessageEntity);
    const whereCondition: any[] = [
        { room: { id: roomId }, destination: IsNull() } 
    ];

    if (userId) {
        whereCondition.push({ room: { id: roomId }, destination: { id: userId } }); 
        whereCondition.push({ room: { id: roomId }, user: { id: userId }, destination: Not(IsNull()) });
    }

    const messages = await messageRepo.find({
        where: whereCondition,
        relations: { user: true, destination: true },
        order: { createdAt: 'ASC' }
    });
    

    res.json(messages.map(m => ({
        id: m.id,
        text: m.content,
        user: m.user?.name,
        userId: m.user?.id,
        createdAt: m.createdAt,
        isPrivate: !!m.destinationID,
        destinationName: m.destination?.name
    })));
};

export const getRooms = async (
    start: number, 
    end: number, 
    tag?: string,
    orderBy: 'date' | 'popularity' | 'owner' = 'popularity',
    orderDirection: 'ASC' | 'DESC' = 'DESC',
    ownerId?: string
) => {
    const skip = start;
    const take = end;

    let qb = roomRepository.createQueryBuilder("room")
        .leftJoin("room.users", "user")
        .leftJoin("room.owner", "owner") 
        .select("room.id", "id")
        .addSelect("COUNT(user.id)", "user_count")
        .groupBy("room.id")
        .addGroupBy("owner.name")
        .addGroupBy("room.createdAt") 
        .offset(skip)
        .limit(take);

    if (tag) {
        qb = qb.where(":tag = ANY(room.tags)", { tag });
    }

    if (ownerId) {
        qb = qb.andWhere("owner.id = :ownerId", { ownerId });
    }

    switch (orderBy) {
        case 'date':
            qb = qb.orderBy("room.createdAt", orderDirection);
            break;
        case 'owner':
            qb = qb.orderBy("owner.name", orderDirection);
            break;
        case 'popularity':
        default:
            qb = qb.orderBy("user_count", orderDirection);
            qb = qb.addOrderBy("room.id", "ASC"); 
            break;
    }
    if (orderBy !== 'popularity') {
         qb = qb.addOrderBy("room.id", "ASC");
    }

    const rawResults = await qb.getRawMany();
    
    if (rawResults.length === 0) return [];

    const ids = rawResults.map(r => r.id);

    const rooms = await roomRepository.createQueryBuilder("room")
        .leftJoinAndSelect("room.owner", "owner")
        .leftJoinAndSelect("room.users", "users")
        .where("room.id IN (:...ids)", { ids })
        .getMany();

    rooms.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

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

export const getSimilarRooms = async (roomId: string) => {
    const currentRoom = await roomRepository.findOneBy({ id: roomId });
    
    if (!currentRoom || !currentRoom.tags || currentRoom.tags.length === 0) {
        return getRooms(0, 5);
    }


    const similarRooms = await roomRepository.createQueryBuilder("room")
        .leftJoinAndSelect("room.users", "users")
        .where("room.id != :roomId", { roomId })
        .andWhere("room.tags && :tags", { tags: currentRoom.tags })
        .take(5)
        .getMany();

    if (similarRooms.length < 5) {
        const popular = await getRooms(0, 5 - similarRooms.length);
        const existingIds = new Set(similarRooms.map(r => r.id));
        existingIds.add(roomId);
        
        for (const r of popular) {
            if (!existingIds.has(r.id)) {
                similarRooms.push(r);
                existingIds.add(r.id);
            }
        }
    }

    return similarRooms;
}