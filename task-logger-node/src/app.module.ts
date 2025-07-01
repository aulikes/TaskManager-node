import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskCreatedEvent, TaskCreatedEventSchema } from './task/task-created-event.schema';
import { TaskCreatedListener } from './messaging/rabbitmq/rabbit-task-created-event.listener';
import { TaskCreatedService } from './task/task-created.service';
import { AppLogger } from './logger/app.logger';
import { HealthModule } from './health/health.module';
import { RabbitMqModule } from './messaging/rabbitmq/rabbitmq.module';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    RabbitMqModule,

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
    ]),
  ],
  controllers: [],
  providers: [
    TaskCreatedListener, 
    AppLogger, 
    TaskCreatedService
  ],
})
export class AppModule {}
