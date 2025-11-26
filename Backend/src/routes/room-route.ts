import { Router, type Request, type Response } from "express";
const router:Router = Router();
import z from "zod"
import { createRoom } from "../services/room/create-service.ts";
import { getRoomById } from "../services/room/get-service.ts";
router.post("/",async (req:Request,res:Response)=>{
     const {name,description,tags,owner} = z.object({ 
        name:z.string(),
        description:z.string(),
        tags:z.array(z.string()).optional(),
        owner:z.string()
        }).parse(req.body)
        const room = await createRoom({name,description,tags: tags ?? []},owner)
        res.status(201).json({status:201,room:room})
})

router.post("/join/:id",async(req:Request,res:Response)=>{
        const id = z.string().parse(req.params)
        const room = getRoomById(id)
        
})



export const r = router;
