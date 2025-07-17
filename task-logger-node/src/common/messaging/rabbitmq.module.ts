import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../../logger/logger.module';
import { TaskModule } from '../../task/task.module';
import { FailedEventModule } from '../failed-event/failed-event.module';
import { RabbitMqListenerService } from './rabbitmq-listener.service';
import { TaskCreatedListener } from './rabbit-task-created-event.listener';
import { TaskUpdatedListener } from './rabbit-task-updated-event.listener';
import { TaskDeletedListener } from './rabbit-task-deleted-event.listener';
import { FailedTaskEventListener } from './rabbit-failed-event.listener';

@Module({
  imports: [ConfigModule, LoggerModule, TaskModule, FailedEventModule],
  providers: [
    RabbitMqListenerService,
    TaskCreatedListener,
    TaskUpdatedListener,
    TaskDeletedListener,
    FailedTaskEventListener,
  ],
  exports: [RabbitMqListenerService],
})
export class RabbitMqModule {}
