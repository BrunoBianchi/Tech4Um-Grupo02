import  { Router } from "express";
import z from "zod"
import { createUser } from "../services/user/create-service.ts";
import { generateToken } from "../services/jwt/create-service.ts";
import { validateCredentials } from "../services/user/validateCredentials-service.ts";
import type { UserEntity } from "../models/UserEntity.ts";
const router:Router = Router()


import { authMiddleware } from "../middlewares/auth-middleware.ts";

router.get("/me", authMiddleware, (req, res) => {
    res.status(200).json({ status: 200, user: res.locals.user });
});

router.post("/login",async(req,res)=>{
        const {email,password} = z.object({
        email:z.email(),
        password:z.string().min(6)
    }).parse(req.body)
    const user = await validateCredentials(email,password) as Omit<Partial<UserEntity>,'password'>;
    const token = await generateToken(user)
    res.status(200).json({status:200,token:token,user:user})
})

router.post("/register",async (req,res)=>{
    const schema = z.object({
        name:z.string(),
        email:z.email(),
        password:z.string().min(6)
    }).parse(req.body)
    const user = await createUser(schema) as Omit<Partial<UserEntity>,'password'>
    const token = await generateToken(user)
    res.status(201).json({status:201,token:token,user:user})
})


export const r = router;