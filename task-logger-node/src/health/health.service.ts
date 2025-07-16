import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';
import { RabbitMQHealthIndicator } from './rabbitmq.health';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private readonly mongoHealth: MongoHealthIndicator,
    private readonly rabbitHealth: RabbitMQHealthIndicator,
  ) {}

  @HealthCheck()
  check() {
    return this.health.check([
      // async () => await this.mongoHealth.isTaskEventsDbHealthy(),
      // async () => await this.mongoHealth.isFailedEventsDbHealthy(),
      async () => await this.rabbitHealth.isRabbitHealthy(),
    ]);
  }
}
