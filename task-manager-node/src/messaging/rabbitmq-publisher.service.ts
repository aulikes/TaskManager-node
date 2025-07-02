import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/app.logger';
import { connect, ConfirmChannel, Connection } from 'amqplib';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';

@Injectable()
export class RabbitMQPublisherService implements OnModuleInit {
  private connection: Connection;
  private channel: ConfirmChannel;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    const uri = getRabbitMqUri(this.config);
    this.connection = await connect(uri);
    this.channel = await this.connection.createConfirmChannel();
    this.logger.log('RabbitMQ confirm channel created for publishing');
  }

  async publish(exchange: string, routingKey: string, payload: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

    this.logger.log(`Publishing to ${exchange} with routing key ${routingKey}`);
    this.logger.debug(payload, 'RabbitMQPublisherService');

    return new Promise((resolve, reject) => {
      this.channel.publish(
        exchange,
        routingKey,
        Buffer.from(JSON.stringify(payload)),
        { contentType: 'application/json' },
        (err, ok) => {
          if (err) {
            this.logger.error('Failed to publish message', err);
            reject(err);
          } else {
            this.logger.log('Message published successfully');
            resolve();
          }
        },
      );
    });
  }
}
