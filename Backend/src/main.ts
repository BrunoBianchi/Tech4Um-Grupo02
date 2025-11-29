import "reflect-metadata"; // Trigger restart
import { AppDataSource } from "./config/database/datasource.ts";
import {serverExpress as app} from "./config/express/express-server.ts";
import { initializeSocketServer } from "./config/socketio/socketio-server.ts";

AppDataSource.initialize().then(()=>{
    console.log(`Database Connected at port 5432!`)
    initializeSocketServer(app)
}).catch(err=>{
    console.log(err)
    console.log(`Database could not connect: ${err}`)
})
