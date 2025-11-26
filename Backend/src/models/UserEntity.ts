import { BeforeInsert, Column, Entity, ManyToMany, OneToMany, type Relation } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";
import bcrypt from "bcrypt"
import { RoomEntity } from "./RoomEntity.ts";
import { MessageEntity } from "./MessageEntity.ts";

@Entity()
export class UserEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    name!:string;
    
    @Column({ type: 'varchar' })
    password!:string;
    @BeforeInsert()
    async hashPassword() {
        this.password = await bcrypt.hashSync(this.password,10)
    }
    @Column({ type: 'varchar' })
    email!:string;

    @OneToMany(() => RoomEntity, (room) => room.owner)
    ownedRooms!: Relation<RoomEntity[]>;

    @ManyToMany(() => RoomEntity, (room) => room.users)
    joinedRooms!: Relation<RoomEntity[]>;

    @OneToMany(() => MessageEntity, (message) => message.user)
    messages!: Relation<MessageEntity[]>;

    @OneToMany(() => MessageEntity, (message) => message.destination)
    receivedMessages!: Relation<MessageEntity[]>;
}