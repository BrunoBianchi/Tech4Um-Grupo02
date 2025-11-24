import  { Router } from "express";
import z from "zod"
import { createUser } from "../services/user/create-service.ts";
import { generateToken } from "../services/jwt/create-service.ts";
import { validateCredentials } from "../services/user/validateCredentials-service.ts";
const router:Router = Router()


router.post("/login",async(req,res)=>{
        const {email,password} = z.object({
        email:z.email(),
        password:z.string().min(6)
    }).parse(req.body)
    const user = await validateCredentials(email,password);
    const token = await generateToken(user)
    res.status(201).json({status:200,token})
})

router.post("/register",async (req,res)=>{
    const schema = z.object({
        name:z.string(),
        email:z.email(),
        password:z.string().min(6)
    }).parse(req.body)
    const user = await createUser(schema)
    const token = await generateToken(user)
    res.status(201).json({status:200,token})
})


export const r = router;