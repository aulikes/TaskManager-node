import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from './logger/app.logger';
import { declareRabbitBindings } from './config/declare-bindings';
import { TaskCreatedListener } from './messaging/rabbitmq/rabbit-task-created-event.listener';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  logger.log('TaskLogger-node is starting...', 'Bootstrap');

  // RABBITMQ CONFIGURATION
  // Declarar exchange, colas y bindings en RabbitMQ
  await declareRabbitBindings(config);
  // Configurar el microservicio RabbitMQ
  await app.startAllMicroservices();
  logger.log('RabbitMQ listener started', 'Bootstrap');

  //PORT CONFIGURATION
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`TaskLogger-node is running on port ${port}`);
}
bootstrap();
