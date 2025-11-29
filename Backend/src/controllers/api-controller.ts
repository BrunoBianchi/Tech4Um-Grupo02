import  { Router } from "express";
import {r as authRoute} from "../routes/auth-route.ts"
import {r as roomRoute} from "../routes/room-route.ts"


const router:Router = Router()


router.use('/auth',authRoute)
router.use("/room",roomRoute)
router.get("/health",(req,res,next)=>{
    res.json("Api Router Working!")
})


export const r = router;