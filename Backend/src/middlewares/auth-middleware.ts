import type { NextFunction, Request, Response } from "express";
import { ApiError,APIErrors } from "../services/error/apiError-service.ts";
import { verifyJWT } from "../services/jwt/verify-service.ts";
export const authMiddleware = async(req:Request,res:Response,next:NextFunction)=>{
    const {authorization} = req.headers;
    if(!authorization) throw new ApiError(APIErrors.authorizationError,"Invalid or expired session token!",401);
    const token = authorization.split("Bearer ")[1]
    if(!token) throw new ApiError(APIErrors.authorizationError,"Invalid or expired session token!",401);
    if(!(await verifyJWT(token))) throw new ApiError(APIErrors.authorizationError,"Invalid or expired session token!",401);
    return next();
}