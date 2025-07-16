import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLogger } from './logger/app.logger';
import { HealthModule } from './health/health.module';
import { RabbitMqModule } from './common/messaging/rabbitmq.module';
import { FailedEventModule } from './common/failed-event/failed-event.module';
import { TaskModule } from './task/task.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
    RabbitMqModule,
    TaskModule,
    FailedEventModule,
  ],
  controllers: [],
  providers: [
    AppLogger, 
  ],
  exports: [
  ]
})
export class AppModule {}
