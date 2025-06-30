import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from '../controller/health.controller';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from '../health/rabbitmq.health';
import { RedisHealthIndicator } from '../health/redis.health';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, TypeOrmModule, ConfigModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator, RabbitMQHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
