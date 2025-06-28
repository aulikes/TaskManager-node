import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { CustomHealthIndicator } from '../service/health.service';
export declare class HealthController {
    private health;
    private db;
    private custom;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, custom: CustomHealthIndicator);
    check(): Promise<import("@nestjs/terminus").HealthCheckResult>;
}
