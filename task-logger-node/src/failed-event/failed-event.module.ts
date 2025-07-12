import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module';
import { FailedEvent, FailedEventSchema } from './schema/failed-event.schema';
import { FailedEventService } from './service/failed-event.service';

@Module({
  // Conexión directa a la base de datos task_failed_event_db
  imports: [
    MongooseModule.forRoot(process.env.FAILED_EVENT_MONGO_URI, {
      connectionName: 'failedEventConnection',
    }),
    MongooseModule.forFeature(
      [{ name: FailedEvent.name, schema: FailedEventSchema }],
      'failedEventConnection',
    ),

    LoggerModule,

    // Conexión a MongoDB usando Mongoose
    MongooseModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
    }),
    }),
    MongooseModule.forFeature([
    { name: TaskCreatedEvent.name, schema: TaskCreatedEventSchema },
    { name: TaskUpdatedEvent.name, schema: TaskUpdatedEventSchema },
    { name: TaskDeletedEvent.name, schema: TaskDeletedEventSchema },
    ]),
],
  providers: [FailedEventService],
  exports: [FailedEventService],
})
export class FailedEventModule {}
