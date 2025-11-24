import  { Router } from "express";
import {r as authRoute} from "../routes/auth-route.ts"
const router:Router = Router()


router.use('/auth',authRoute)
router.get("/health",(req,res,next)=>{
    res.json("API Working!")
})
export const r = router;