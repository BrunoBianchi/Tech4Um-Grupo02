import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";

@Entity()
export class RoomEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    name!:string;

    @Column({ type: 'varchar' })
    description!:string;

    @Column("text", { array: true })
    tags!:Array<string>

}