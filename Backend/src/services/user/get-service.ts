import { AppDataSource } from "../../config/database/datasource.ts"
import { UserEntity } from "../../models/UserEntity.ts"
const userRepository = AppDataSource.getRepository(UserEntity)
export const getUserByEmail= async (email:string):Promise<Partial<UserEntity> | null> => {
    return await userRepository.findOneBy({
        email:email
    }) as Partial<UserEntity>
}