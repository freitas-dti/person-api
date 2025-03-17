import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
// Criar aplicação HTTP
const app = await NestFactory.create(AppModule);

app.connectMicroservice<MicroserviceOptions>(
    {
        transport: Transport.GRPC,
        options: {
            package: 'person',
            protoPath: join(__dirname, '../src/proto/person.proto'),
            url: '0.0.0.0:50051'
        },
    },
);

// Iniciar ambos os serviços
await app.startAllMicroservices();
await app.listen(3000);

console.log('HTTP server running on port 3000');
console.log('gRPC server running on port 50051');
}
bootstrap();