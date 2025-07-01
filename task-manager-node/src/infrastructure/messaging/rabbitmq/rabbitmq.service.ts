import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../../util/get-rabbitmq-uri';
import { AppLogger } from '../../../logger/app.logger';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private connection: amqp.Connection;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async getConfirmChannel(exchangeEnvKey: string): Promise<amqp.ConfirmChannel> {
    try {
      const uri = getRabbitMqUri(this.config);
      const exchange = this.config.getOrThrow<string>(exchangeEnvKey);

      if (!this.connection) {
        this.logger.log('Connecting to RabbitMQ...');
        this.connection = await amqp.connect(uri);
      }

      const channel = await this.connection.createConfirmChannel();
      await channel.assertExchange(exchange, 'topic', { durable: true });

      this.logger.log(`Confirm channel initialized for exchange "${exchange}"`);
      return channel;
    } catch (err) {
      this.logger.error('Failed to get RabbitMQ confirm channel', err);
      throw err;
    }
  }
}
