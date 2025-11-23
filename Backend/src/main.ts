import express from "express"
import * as dotenv from "dotenv"
dotenv.config({
    quiet:true,
})
const app = express()
const port= process.env.EXPRESS_PORT || 3000
app.use(express.json());

app.listen(port,()=>{
    console.log(`Server Running at port ${port}`)
})