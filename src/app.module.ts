import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PersonModule } from './person/person.module';
import { Person } from './person/person.entity';

@Module({
imports: [
    ConfigModule.forRoot({
        isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
            type: 'postgres',
            host: configService.get('DATABASE_HOST'),
            port: configService.get('DATABASE_PORT'),
            username: configService.get('DATABASE_USER'),
            password: configService.get('DATABASE_PASSWORD'),
            database: configService.get('DATABASE_NAME'),
            entities: [Person],
            synchronize: true, // Não use em produção!
        }),
        inject: [ConfigService],
    }),
    PersonModule,
],
})
export class AppModule {}