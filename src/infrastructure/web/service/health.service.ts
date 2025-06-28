import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';
import * as amqplib from 'amqplib';
import { retryFlexible } from '../../utils/resilience-utils';

@Injectable()
export class CustomHealthIndicator extends HealthIndicator {
  private readonly logger = new Logger(CustomHealthIndicator.name);

  constructor(private readonly config: ConfigService) {
    super();
  }

  async isRedisHealthy(): Promise<HealthIndicatorResult> {
    const redis = new Redis({
      host: this.config.get('REDIS_HOST'),
      port: Number(this.config.get('REDIS_PORT')),
    });

    try {
      await retryFlexible(() => redis.ping(), this.config, 'Redis Ping');
      redis.disconnect();
      return this.getStatus('redis', true);
    } catch (err) {
      redis.disconnect();
      this.logger.error(`Redis health check failed: ${err.message}`);
      throw new HealthCheckError('Redis check failed', this.getStatus('redis', false));
    }
  }

  async isRabbitHealthy(): Promise<HealthIndicatorResult> {
    const uri = `amqp://${this.config.get('RABBITMQ_USER')}:${this.config.get('RABBITMQ_PASSWORD')}@${this.config.get('RABBITMQ_HOST')}:${this.config.get('RABBITMQ_PORT')}`;
    try {
      await retryFlexible(async () => {
        const conn = await amqplib.connect(uri);
        await conn.close();
      }, this.config, 'RabbitMQ Connect');
      return this.getStatus('rabbitmq', true);
    } catch (err) {
      this.logger.error(`RabbitMQ health check failed: ${err.message}`);
      throw new HealthCheckError('RabbitMQ check failed', this.getStatus('rabbitmq', false));
    }
  }
}
