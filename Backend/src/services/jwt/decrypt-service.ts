import * as jose from "jose"
import * as dotenv from "dotenv"
import type { UserEntity } from "../../models/UserEntity.ts";

dotenv.config({
    quiet:true,
})
export const decryptJWT = async (token:string):Promise<Partial<UserEntity>| Boolean> => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        const { payload } = await jose.jwtVerify(token, secret);
        return payload as Partial<UserEntity>;
    }catch(err) {
        return false;
    }
}