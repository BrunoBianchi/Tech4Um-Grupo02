import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";

@Entity()
export class MessageEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    content!:string;

    @Column({ type: 'varchar' })
    ReplyToID!:string;

    @Column({ type: 'varchar' })
    destinationID!:string;    

}