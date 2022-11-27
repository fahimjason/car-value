import { AfterInsert, Entity, Column, PrimaryGeneratedColumn, AfterUpdate, AfterRemove } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    email: string;

    @Column()
    @Exclude()
    password: string;

    @AfterInsert()
    logInsert() {
        console.log('Insert user with id', this.id);
    }

    @AfterUpdate()
    logUpdate() {
        console.log('Update user with id', this.id);
    }

    @AfterRemove()
    logRemove() {
        console.log('Remove user with id', this.id);
    }
}