import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { Person } from './person.entity';

@Module({
imports: [TypeOrmModule.forFeature([Person])],
controllers: [PersonController],
providers: [PersonService],
})
export class PersonModule {}