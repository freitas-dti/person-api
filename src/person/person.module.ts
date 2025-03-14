import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonController } from './person.controller';
import { PersonService } from './person.service';
import { Person } from './person.entity';
import { SeedController } from './seed.controller';
import { SeedService } from './seed.service';

@Module({
imports: [TypeOrmModule.forFeature([Person])],
controllers: [PersonController, SeedController],
providers: [PersonService, SeedService],
})
export class PersonModule {}