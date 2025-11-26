import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity.ts";
import bcrypt from "bcrypt"
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
}