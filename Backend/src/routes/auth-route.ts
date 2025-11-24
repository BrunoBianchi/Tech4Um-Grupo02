import  { Router } from "express";
import z from "zod"
import { validator } from "../middlewares/validateSchema-middleware.ts";
const router:Router = Router()


router.post("/login",(req,res)=>{

})

router.post("/register",(req,res,next)=>{
    validator(req,res,next,[{
        name:z.string(),
        email:z.email(),
        password:z.string().min(6)
    }],'body')
})


export const r = router;