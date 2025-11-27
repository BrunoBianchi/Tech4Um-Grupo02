import { Router, type Request, type Response } from "express";
const router:Router = Router();
import z from "zod"
import { createRoom } from "../services/room/create-service.ts";
import { getRooms } from "../services/room/get-service.ts";
import { joinRoom } from "../services/room/join-service.ts";
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
        const { id } = z.object({ id: z.string() }).parse(req.params)
        const { socketId } = z.object({ socketId: z.string() }).parse(req.body)
        await joinRoom(id,socketId)
        res.status(200).json("Joined Room")
})

router.get("/rooms",async(req:Request,res:Response)=>{
        res.status(200).json({rooms:await getRooms()})
})


export const r = router;
