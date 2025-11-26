import { Column, Entity, JoinColumn, ManyToOne, type Relation } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";
import { RoomEntity } from "./RoomEntity.ts";
import { UserEntity } from "./UserEntity.ts";

@Entity()
export class MessageEntity extends BaseEntity {
    @Column({ type: 'varchar' })
    content!:string;

    @ManyToOne(() => RoomEntity, (room) => room.messages)
    room!: Relation<RoomEntity>;

    @ManyToOne(() => UserEntity, (user) => user.messages)
    user!: Relation<UserEntity>;

    @Column({ type: 'varchar', nullable: true })
    ReplyToID!: string | null;

    @ManyToOne(() => MessageEntity, { nullable: true })
    @JoinColumn({ name: 'ReplyToID' })
    replyTo!: Relation<MessageEntity> | null;

    @Column({ type: 'varchar', nullable: true })
    destinationID!: string | null;

    @ManyToOne(() => UserEntity, (user) => user.receivedMessages, { nullable: true })
    @JoinColumn({ name: 'destinationID' })
    destination!: Relation<UserEntity> | null;
}