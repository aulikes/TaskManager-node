import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';
import { RabbitTaskCreatedEventPublisher } from './rabbit-task-created-event.publisher';
import { AppLogger } from '../logger/app.logger';

@Module({
  imports: [ConfigModule],
  providers: [
    RabbitTaskCreatedEventPublisher, 
    RabbitMQPublisherService, 
    AppLogger
  ],
  exports: [
    RabbitTaskCreatedEventPublisher, 
    RabbitMQPublisherService
  ],
})
export class RabbitMQModule {}
