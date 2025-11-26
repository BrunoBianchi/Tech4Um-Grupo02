import * as jose from "jose"
import * as dotenv from "dotenv"

dotenv.config({
    quiet:true,
})
export const verifyJWT = async (token:string) => {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    try {
        await jose.jwtVerify(token, secret);
          return true
    }catch(err) {
        return false
    }
  
}