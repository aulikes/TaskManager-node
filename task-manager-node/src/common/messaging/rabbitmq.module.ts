import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SchemaModule } from '../schema/schema.module';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';
import { RabbitTaskCreatedEventPublisher } from './rabbit-task-created-event.publisher';
import { RabbitTaskUpdatedEventPublisher } from './rabbit-task-updated-event.publisher';
import { RabbitTaskDeletedEventPublisher } from './rabbit-task-deleted-event.publisher';
import { AppLogger } from '../../logger/app.logger';

@Module({
  imports: [ConfigModule, SchemaModule],
  providers: [
    RabbitTaskCreatedEventPublisher, 
    RabbitTaskUpdatedEventPublisher, 
    RabbitTaskDeletedEventPublisher, 
    RabbitMQPublisherService, 
    AppLogger
  ],
  exports: [
    RabbitTaskCreatedEventPublisher, 
    RabbitTaskUpdatedEventPublisher, 
    RabbitTaskDeletedEventPublisher, 
    RabbitMQPublisherService
  ],
})
export class RabbitMQModule {}
