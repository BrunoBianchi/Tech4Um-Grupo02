import { Router, type Request, type Response } from "express";
import z from "zod"
import { createRoom } from "../services/room/create-service.ts";
import { getRoomMessages, getRooms, getSimilarRooms } from "../services/room/get-service.ts";
import { joinRoom } from "../services/room/join-service.ts";
import { authMiddleware } from "../middlewares/auth-middleware.ts";

const router:Router = Router();

router.get('/:roomId/messages', authMiddleware, getRoomMessages);
router.get('/:roomId/similar', authMiddleware, async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const rooms = await getSimilarRooms(roomId as string) ;
    res.json(rooms.map(r => ({
        id: r.id,
        name: r.name,
        count: r.users?.length || 0,
        tags: r.tags
    })));
});
router.post("/",authMiddleware,async (req:Request,res:Response)=>{
     const {name,description,tags,owner} = z.object({ 
        name:z.string(),
        description:z.string(),
        tags:z.array(z.string()).optional(),
        owner:z.string()
        }).parse(req.body)
        const room = await createRoom({name,description,tags: tags ?? []},owner)
        res.status(201).json({status:201,room:room})
})

router.post("/join/:id",authMiddleware,async(req:Request,res:Response)=>{
        const { id } = z.object({ id: z.string() }).parse(req.params)
        const { socketId } = z.object({ socketId: z.string() }).parse(req.body)
        await joinRoom(id,socketId)
        res.status(200).json("Joined Room")
})

router.get("/rooms",async(req:Request,res:Response)=>{
        const { start, end, tag, orderBy, orderDirection, ownerId } = z.object({
                start:z.coerce.number(),
                end:z.coerce.number(),
                tag: z.string().optional(),
                orderBy: z.enum(['date', 'popularity', 'owner']).optional(),
                orderDirection: z.enum(['ASC', 'DESC']).optional(),
                ownerId: z.string().optional()
        }).parse(req.query)
        res.status(200).json({rooms:await getRooms(start,end, tag, orderBy, orderDirection, ownerId)})
})


export const r = router;
