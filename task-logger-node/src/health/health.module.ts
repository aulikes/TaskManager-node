import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { HealthService } from './health.service';
import { AppLogger } from '../logger/app.logger';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [
    AppLogger,
    HealthService,
    MongooseHealthIndicator, 
    MongoHealthIndicator,
    RabbitMQHealthIndicator, 
  ],
})
export class HealthModule {}
