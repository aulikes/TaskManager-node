import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { RabbitMQHealthIndicator } from '../health/rabbitmq.health';
import { RedisHealthIndicator } from '../health/redis.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private redis: RedisHealthIndicator,
    private rabbit: RabbitMQHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => this.redis.isRedisHealthy(),
      async () => this.rabbit.isRabbitHealthy(),
    ]);
  }
}
