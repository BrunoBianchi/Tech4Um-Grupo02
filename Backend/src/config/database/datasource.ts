import { DataSource } from "typeorm";
import { UserEntity } from "../../models/UserEntity.ts";
import { RoomEntity } from "../../models/RoomEntity.ts";
import { MessageEntity } from "../../models/MessageEntity.ts";
import "dotenv/config";

export const AppDataSource= new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME ?? "",
    entities:[UserEntity,MessageEntity, RoomEntity],
    synchronize: true,
    logging: false
})