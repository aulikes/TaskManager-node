import { Injectable } from '@nestjs/common';
import { HealthCheckService, HealthCheck, HealthIndicatorResult } from '@nestjs/terminus';
import { MongoHealthIndicator } from './mongo.health';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private mongoHealth: MongoHealthIndicator,
  ) {}

  @HealthCheck()
  check() {
    return this.health.check([
      async () => await this.mongoHealth.isHealthy(),
    ]);
  }
}
