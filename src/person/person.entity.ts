import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';

@Entity()
export class Person {
@PrimaryGeneratedColumn()
id: number;

@Column()
@Index()
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
@Index()
createdAt: Date;

@Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
@Index()
syncedAt: Date;
}