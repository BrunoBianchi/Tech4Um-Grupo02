import { Column } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";


export class MessageEntity extends BaseEntity {
    @Column()
    content!:string;

    @Column()
    ReplyToID!:string;

    @Column()
    destinationID!:string;    

}