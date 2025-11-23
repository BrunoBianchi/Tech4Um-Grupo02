import express from "express"
import * as dotenv from "dotenv"
import "reflect-metadata";
import { AppDataSource } from "./config/database/datasource.ts";
dotenv.config({
    quiet:true,
})
const app = express()
const port= process.env.EXPRESS_PORT || 3000
app.use(express.json());
AppDataSource.initialize().then(()=>{
    console.log(`Database Connected at port 5432!`)
app.listen(port,()=>{
    console.log(`Server Running at port ${port}`)
})
}).catch(err=>{
    console.log(err)
    console.log(`Database could not connect: ${err}`)
})
