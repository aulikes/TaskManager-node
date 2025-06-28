import { ConfigService } from '@nestjs/config';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
export declare class CustomHealthIndicator extends HealthIndicator {
    private readonly config;
    private readonly logger;
    constructor(config: ConfigService);
    isRedisHealthy(): Promise<HealthIndicatorResult>;
    isRabbitHealthy(): Promise<HealthIndicatorResult>;
}
