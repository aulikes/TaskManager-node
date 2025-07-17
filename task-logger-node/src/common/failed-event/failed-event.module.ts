import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../../logger/logger.module';
import { FailedEvent, FailedEventSchema } from './failed-event.schema';
import { FailedTaskEventService } from './failed-event.service';
import { NAME_CONNECTION_FAILED_EVENTS } from '../../config/database.constants';

@Module({
  // Conexión directa a la base de datos task_failed_event_db
  imports: [
    LoggerModule,
    // Conexión a MongoDB usando Mongoose
    MongooseModule.forRootAsync({
      connectionName: NAME_CONNECTION_FAILED_EVENTS,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('FAILED_EVENT_MONGO_URI')
      }),
    }),
    MongooseModule.forFeature([
        { name: FailedEvent.name, schema: FailedEventSchema },
      ],
      NAME_CONNECTION_FAILED_EVENTS),
],
  providers: [FailedTaskEventService],
  exports: [FailedTaskEventService],
})
export class FailedEventModule {}
