import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, type Relation } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";
import { UserEntity } from "./UserEntity.ts";
import { MessageEntity } from "./MessageEntity.ts";

@Entity()
export class RoomEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    name!:string;

    @Column({ type: 'varchar' })
    description!:string;

    @Column("text", { array: true })
    tags?:Array<string>

    @ManyToOne(() => UserEntity, (user) => user.ownedRooms)
    owner!: Relation<UserEntity>;

    @ManyToMany(() => UserEntity, (user) => user.joinedRooms)
    @JoinTable()
    users!: Relation<UserEntity[]>;

    @OneToMany(() => MessageEntity, (message) => message.room)
    messages!: Relation<MessageEntity[]>;
}