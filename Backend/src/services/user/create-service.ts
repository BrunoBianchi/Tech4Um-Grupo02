import { AppDataSource } from "../../config/database/datasource.ts"
import { UserEntity } from "../../models/UserEntity.ts"
import { getUserByEmail } from "./get-service.ts"
const userRepository = AppDataSource.getRepository(UserEntity)
import { ApiError, APIErrors } from "../error/apiError-service.ts"
export const createUser = async (user:Partial<UserEntity>):Promise<Partial<UserEntity> | Error> => {
        if(await getUserByEmail(user.email as string)) throw new ApiError(APIErrors.badRequestError,"User with email already exists!",409)
        const newUser = userRepository.create(user)
        await userRepository.save(newUser)
        return newUser
}