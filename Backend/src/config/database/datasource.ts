import { DataSource } from "typeorm";
import { UserEntity } from "../../models/UserEntity.ts";
import { RoomEntity } from "../../models/RoomEntity.ts";
import { MessageEntity } from "../../models/MessageEntity.ts";

export const AppDataSource= new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "",
    entities:[UserEntity,MessageEntity, RoomEntity],
    synchronize: true,
    logging: false
})