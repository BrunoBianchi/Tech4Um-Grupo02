import type { NextFunction, Request, Response } from "express";
import z from "zod"
interface validatorSchema {
  [key: string]: any;
}
export const validator = (req:Request,res:Response,next:NextFunction,schema:validatorSchema[],parser:"body"|"params"|"query") => {
    try {
        z.object(schema).parse(req[parser])
        next();
    }catch(err) {
        throw new Error("Invalid Schema !")
    }
}