import express from "express"
import {r as api} from "../../controllers/api-controller.ts"
import { errorMiddleware } from "../../middlewares/error-middleware.ts"
import * as dotenv from "dotenv"
import cors from "cors"
dotenv.config({
    quiet:true,
})
const port= process.env.EXPRESS_PORT || 3000
const app: express.Express = express()
app.use(cors({
    origin: '*'
}))
app.use(express.json());
app.use('/api',api)
app.use(errorMiddleware)

export const serverExpress = app
export const initializeExpressServer = () =>{
app.listen(port,()=>{
    console.log(`Server Listening at port ${port}`)
})
}
