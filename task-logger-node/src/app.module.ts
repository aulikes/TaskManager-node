import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskCreatedEvent, TaskCreatedEventSchema } from './task/schema/task-created-event.schema';
import { TaskUpdatedEvent, TaskUpdatedEventSchema } from './task/schema/task-updated-event.schema';
import { TaskDeletedEvent, TaskDeletedEventSchema } from './task/schema/task-deleted-event.schema';
import { AppLogger } from './logger/app.logger';
import { HealthModule } from './health/health.module';
import { RabbitMqModule } from './messaging/rabbitmq/rabbitmq.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    RabbitMqModule,
    TaskModule,
  ],
  controllers: [],
  providers: [
    AppLogger, 
  ],
  exports: [
  ]
})
export class AppModule {}
