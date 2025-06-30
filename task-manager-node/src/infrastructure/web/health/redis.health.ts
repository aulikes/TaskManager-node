import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { retryFlexible } from '../../utils/resilience-utils';

/**
 * Verifica la conexión con Redis.
 */
@Injectable()
export class RedisHealthIndicator {
  private readonly logger = new Logger(RedisHealthIndicator.name);

  constructor(private config: ConfigService) {}

  async isRedisHealthy(): Promise<HealthIndicatorResult> {
    const redis = new Redis({
        host: this.config.get('REDIS_HOST'),
        port: Number(this.config.get('REDIS_PORT')),
    });

    try {
        await retryFlexible(() => redis.ping(), this.config, 'Redis Ping');
        redis.disconnect();
        return { redis: { status: 'up' } };
    } catch (err) {
        redis.disconnect();
        this.logger.error(`Redis health check failed: ${err.message}`);
        return {
        redis: {
            status: 'down',
            message: err.message,
        },
        };
    }
    }
}
