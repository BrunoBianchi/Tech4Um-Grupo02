import type { NextFunction, Request, Response } from "express";
import { ApiError, APIErrors } from "../services/error/apiError-service.ts";
import { ZodError } from "zod";

const Errors =  {
    ZodError:(err:ZodError):{cause:APIErrors,message:string,code:number}=>{
        const messageError = JSON.parse(err.message.replace("[ "," ")
        .replace("] "," ").trim())

        const msg = messageError
        .map((err:{expected:string,code:string,path:string[],message:string}) => 
        `${err.message} in ${err.path}`).join(". ");

        return {
            cause:APIErrors.badRequestError,
            message:msg,
            code:400
        }
    },
    Error:(err:ApiError):{cause:APIErrors,message:string,code:number}=>{
        return JSON.parse((err.toString().split("Error:")[1]!).trim())
    }
}

export const errorMiddleware = (err:ApiError,req:Request,res:Response,next:NextFunction)=> {
    console.log(err)
    const error:{cause:APIErrors,message:string,code:number} =  Errors[err.name as keyof typeof Errors](err as ApiError | ZodError | any)
    if(err) return res.status(error.code).json({cause:error.cause,message:error.message})
    return next();
}