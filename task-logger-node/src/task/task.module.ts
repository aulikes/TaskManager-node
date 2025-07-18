import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { MetricsModule } from '../metrics/metrics.module';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskCreatedEvent, TaskCreatedEventSchema } from './schema/task-created-event.schema';
import { TaskUpdatedEvent, TaskUpdatedEventSchema } from './schema/task-updated-event.schema';
import { TaskDeletedEvent, TaskDeletedEventSchema } from './schema/task-deleted-event.schema';
import { TaskCreatedService } from './service/task-created.service';
import { TaskUpdatedService } from './service/task-updated.service';
import { TaskDeletedService } from './service/task-deleted.service';
import { NAME_CONNECTION_LOGGER_EVENTS } from '../config/database.constants';

@Module({
  imports: [
    LoggerModule,
    MetricsModule,

    // Conexión a MongoDB usando Mongoose
    MongooseModule.forRootAsync({
      connectionName: NAME_CONNECTION_LOGGER_EVENTS,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI')
      }),
    }),
    MongooseModule.forFeature([
        { name: TaskCreatedEvent.name, schema: TaskCreatedEventSchema },
        { name: TaskUpdatedEvent.name, schema: TaskUpdatedEventSchema },
        { name: TaskDeletedEvent.name, schema: TaskDeletedEventSchema },
      ], 
      NAME_CONNECTION_LOGGER_EVENTS)
  ],
  controllers: [],
  providers: [
    TaskCreatedService,
    TaskUpdatedService,
    TaskDeletedService,
  ],
  exports: [
    TaskCreatedService,
    TaskUpdatedService,
    TaskDeletedService,
  ]
})
export class TaskModule {}
