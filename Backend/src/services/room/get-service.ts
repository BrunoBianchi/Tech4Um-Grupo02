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

    console.log(`[API] getRoomMessages called for roomId: ${roomId}, userId: ${userId}`);
    if (!roomId) return res.status(400).json({ error: 'Missing roomId' });
    
    const messageRepo = AppDataSource.getRepository(MessageEntity);
    
    // Query: Public messages OR Private messages where user is sender OR recipient
    // If no userId (shouldn't happen with authMiddleware), show only public
    const whereCondition: any[] = [
        { room: { id: roomId }, destination: IsNull() } // Public
    ];

    if (userId) {
        whereCondition.push({ room: { id: roomId }, destination: { id: userId } }); // Received private
        whereCondition.push({ room: { id: roomId }, user: { id: userId }, destination: Not(IsNull()) }); // Sent private
    }

    const messages = await messageRepo.find({
        where: whereCondition,
        relations: { user: true, destination: true },
        order: { createdAt: 'ASC' }
    });
    
    console.log(`[API] Found ${messages.length} messages for room ${roomId}`);

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

export const getRooms = async (start: number, end: number, tag?: string) => {
    const skip = start;
    const take = end;

    // 1. Obter IDs das salas ordenadas pela quantidade de usuários
    let qb = roomRepository.createQueryBuilder("room")
        .leftJoin("room.users", "user")
        .select("room.id", "id")
        .addSelect("COUNT(user.id)", "user_count")
        .groupBy("room.id")
        .orderBy("user_count", "DESC")
        .addOrderBy("room.id", "ASC") // Desempate
        .offset(skip)
        .limit(take);

    if (tag) {
        qb = qb.where(":tag = ANY(room.tags)", { tag });
    }

    const rawResults = await qb.getRawMany();
    
    if (rawResults.length === 0) return [];

    const ids = rawResults.map(r => r.id);

    // 2. Buscar as salas completas com as relações
    const rooms = await roomRepository.createQueryBuilder("room")
        .leftJoinAndSelect("room.owner", "owner")
        .leftJoinAndSelect("room.users", "users")
        .where("room.id IN (:...ids)", { ids })
        .getMany();

    // 3. Reordenar em memória para garantir a ordem correta
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
    
    // If room not found or no tags, return popular rooms as fallback
    if (!currentRoom || !currentRoom.tags || currentRoom.tags.length === 0) {
        return getRooms(0, 5);
    }

    // Find rooms that share tags, excluding current room
    // Using Postgres array overlap operator &&
    const similarRooms = await roomRepository.createQueryBuilder("room")
        .leftJoinAndSelect("room.users", "users")
        .where("room.id != :roomId", { roomId })
        .andWhere("room.tags && :tags", { tags: currentRoom.tags })
        .take(5)
        .getMany();

    // If few matches, fill with popular rooms
    if (similarRooms.length < 5) {
        const popular = await getRooms(0, 5 - similarRooms.length);
        // Filter out duplicates
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