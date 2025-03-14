import { Controller, Post, Query } from '@nestjs/common';
import { SeedService } from './seed.service';

@Controller('seed')
export class SeedController {
constructor(private readonly seedService: SeedService) {}

@Post('people')
async seedPeople(@Query('count') count: number = 10000) {
    return await this.seedService.seedDatabase(count);
}
}