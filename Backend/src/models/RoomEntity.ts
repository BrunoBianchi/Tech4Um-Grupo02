import { Column } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";


export class RoomEntity extends BaseEntity {
    @Column()
    name!:string;

    @Column()
    description!:string;

    @Column()
    tags!:Array<string>

}