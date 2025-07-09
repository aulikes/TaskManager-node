import { Injectable } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';
import { RabbitMQHealthIndicator } from './rabbitmq.health';
import { RedisHealthIndicator } from './redis.health';
@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly mongoHealth: MongoHealthIndicator,
    private readonly rabbitHealth: RabbitMQHealthIndicator,
    private readonly redisHealth: RedisHealthIndicator,
  ) {}

  /**
   * Ejecuta los indicadores de salud registrados.
   * @returns Un objeto que indica el estado de salud de los servicios.
   */
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => await this.mongoHealth.isHealthy(),
      async () => await this.rabbitHealth.isRabbitHealthy(),
      async () => await this.redisHealth.isRedisHealthy(),
    ]);
  }
}
