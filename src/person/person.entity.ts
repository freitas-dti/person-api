import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Person {
@PrimaryGeneratedColumn()
id: number;

@Column()
name: string;

@Column()
lastName: string;

@Column()
age: number;

@Column('decimal', { precision: 5, scale: 2 })
weight: number;

@Column({ nullable: true })
localId: string;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
createdAt: Date;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
syncedAt: Date;
}