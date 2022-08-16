import { NestFactory } from '@nestjs/core';
import { RedisOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<RedisOptions>(AppModule, {
    transport: Transport.REDIS,
    options: {
      port: 6379,
      host: 'localhost',
    },
  });
  await app.listen();
  await app.close();
}
bootstrap();
