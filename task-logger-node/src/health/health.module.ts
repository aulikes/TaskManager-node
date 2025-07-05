import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { LoggerModule } from '../logger/logger.module';
import { HealthController } from './health.controller';
import { MongooseHealthIndicator } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { HealthService } from './health.service';

@Module({
  imports: [TerminusModule, LoggerModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    // MongooseHealthIndicator, 
    MongoHealthIndicator,
    RabbitMQHealthIndicator, 
  ],
})
export class HealthModule {}
