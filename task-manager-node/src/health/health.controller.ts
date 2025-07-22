import { Controller, Get } from '@nestjs/common';
// import { HealthCheckService, TypeOrmHealthIndicator, HealthCheck } from '@nestjs/terminus';
import { HealthCheck, HealthCheckResult } from '@nestjs/terminus';
import { HealthService } from './health.service';

/**
 * Controlador para exponer el endpoint de verificación de salud (/health).
 */
@Controller('health')
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) {}

  /**
   * GET /health
   * Ejecuta los indicadores de salud registrados en HealthService.
   */
  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.healthService.check();
  }
}

