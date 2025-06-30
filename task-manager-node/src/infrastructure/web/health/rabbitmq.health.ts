import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqplib from 'amqplib';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { retryFlexible } from '../../utils/resilience-utils';
import { getRabbitMqUri } from '../../utils/get-rabbitmq-uri';

/**
 * Verifica la conexión con RabbitMQ sin extender clases de Terminus.
 */
@Injectable()
export class RabbitMQHealthIndicator {
  private readonly logger = new Logger(RabbitMQHealthIndicator.name);

  constructor(private config: ConfigService) {}

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
