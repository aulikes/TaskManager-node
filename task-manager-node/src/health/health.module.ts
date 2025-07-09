import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from '../logger/app.logger';
import { HealthController } from './health.controller';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';
import { RabbitMQHealthIndicator } from '../health/rabbitmq.health';
import { RedisHealthIndicator } from '../health/redis.health';
import { HealthService } from './health.service';

@Module({
  imports: [
    TerminusModule, 
    TypeOrmModule, 
    ConfigModule
  ],
  controllers: [HealthController],
  providers: [
    HealthService,
    TypeOrmHealthIndicator, 
    MongoHealthIndicator,
    RabbitMQHealthIndicator, 
    RedisHealthIndicator,
    AppLogger,
  ]  
})
export class HealthModule {}
