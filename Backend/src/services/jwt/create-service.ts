import * as jose from "jose"
import type { UserEntity } from "../../models/UserEntity.ts"
import * as dotenv from "dotenv"
dotenv.config({
    quiet:true,
})
const secret = new TextEncoder().encode(
  process.env.JWT_SECRET
)
const alg = 'HS256'

export const generateToken = async(user:Partial<UserEntity>):Promise<string> => {
  return await new jose.SignJWT({ ...user })
  .setProtectedHeader({ alg })
  .setIssuedAt()
  .setIssuer('urn:example:issuer')
  .setAudience('urn:example:audience')
  .setExpirationTime('7d')
  .sign(secret)

}