import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { CustomHealthIndicator } from '../service/health.service';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private custom: CustomHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      async () => this.db.pingCheck('postgres'),
      async () => this.custom.isRedisHealthy(),
      async () => this.custom.isRabbitHealthy(),
    ]);
  }
}
