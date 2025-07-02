import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { retryFlexible } from '../util/resilience-utils';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';
import { AppLogger } from '../logger/app.logger';

/**
 * Verifica la conexión con RabbitMQ sin extender clases de Terminus.
 */
@Injectable()
export class RabbitMQHealthIndicator {
    constructor(
        private readonly config: ConfigService,
        private readonly logger: AppLogger,
    ) {}

    async isRabbitHealthy(): Promise<HealthIndicatorResult> {
    const uri = getRabbitMqUri(this.config);
        try {
            await retryFlexible(async () => {
            const conn = await amqplib.connect(uri);
            await conn.close();
            }, this.config, 'RabbitMQ Connect');
            return { rabbitmq: { status: 'up' } };
        } catch (err) {
            this.logger.error(`RabbitMQ health check failed: ${err.message}`);
            return {
                rabbitmq: {
                    status: 'down',
                    message: err.message,
                },
            };
        }
    }
}
