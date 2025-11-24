import { getUserByEmail } from "./get-service.ts";
import bcrypt from "bcrypt"
import { ApiError,APIErrors } from "../error/apiError-service.ts";
export const validateCredentials = async(email:string,password:string) =>{
    const userObject = await getUserByEmail(email as string);
    if(!userObject) throw  new ApiError(APIErrors.authenticationError,"Invalid Credantials!",400);
    const isAutorized = await bcrypt.compare(password,userObject.password as string)
    if(!isAutorized) throw new ApiError(APIErrors.authenticationError,"Invalid Credantials!",400);
    return userObject
}