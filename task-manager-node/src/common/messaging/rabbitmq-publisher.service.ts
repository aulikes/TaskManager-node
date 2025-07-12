import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/app.logger';
import { connect, ConfirmChannel, Connection } from 'amqplib';
import { getRabbitMqUri } from '../../util/get-rabbitmq-uri';
import { retryWithTimeout } from '../../util/retry-with-timeout.util';
import { getClassMethodContextLabel } from '../../util/get-class-method-context-label.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedEvent, FailedEventDocument } from '../failed-event/failed-event.schema';
import { MessagePublishingException } from '../exceptions/message-publishing.exception';

@Injectable()
export class RabbitMQPublisherService implements OnModuleInit {
  private connection: Connection;
  private channel: ConfirmChannel;

  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
    @InjectModel(FailedEvent.name)
    private readonly failedEventModel: Model<FailedEventDocument>,
  ) {}

  /**
   * Inicializa la conexión y el canal confirmable con RabbitMQ
   */
  async onModuleInit() {
    const uri = getRabbitMqUri(this.config);

    this.connection = await connect(uri);
    this.connection.on('error', (err) => this.handleChannelOrConnectionError(err, 'Connection'));

    this.channel = await this.connection.createConfirmChannel();
    this.channel.on('error', (err) => this.handleChannelOrConnectionError(err, 'Channel'));

    this.logger.log('RabbitMQ confirm channel created for publishing');
  }

  /**
   * Publica un mensaje al exchange usando retry + timeout por intento.
   * Si falla, persiste el evento fallido en MongoDB y lanza una excepción controlada.
   */
  async publish(exchange: string, routingKey: string, payload: any): Promise<void> {
    if (!this.channel) {
      throw new MessagePublishingException('Channel not initialized', exchange, routingKey);
    }

    this.logger.log(`Publishing to ${exchange} with routing key ${routingKey}`);
    this.logger.debug(payload, 'RabbitMQPublisherService');

    try {
      // Retry resiliente con timeout por intento y logging con contexto automático
      await retryWithTimeout(
        () =>
          new Promise<void>((resolve, reject) => {
            this.channel.publish(
              exchange,
              routingKey,
              Buffer.from(JSON.stringify(payload)),
              { contentType: 'application/json' },
              (err) => (err ? reject(err) : resolve()),
            );
          }),
        this.config,
        this.logger,
        getClassMethodContextLabel(this),
      );
      this.logger.log('Message published successfully');
    } catch (err) {
      await this.persistFailedEvent(exchange, routingKey, payload, err.message);
      // throw new MessagePublishingException(err.message, exchange, routingKey); // Si se quiere lanzar excepción controlada al frontend
    }
  }

  /** Maneja cualquier error emitido por connection o channel para evitar crash global */
  private async handleChannelOrConnectionError(err: Error, origin: 'Channel' | 'Connection') {
    this.logger.error(`${origin} emitted error: ${err.message}`, err.stack);

    // Persiste un evento genérico con motivo del fallo.
    await this.persistFailedEvent('unknown', 'unknown', {}, `${origin} error: ${err.message}`);
  }

  /** Persiste evento fallido en Mongo (DLQ manual) */
  private async persistFailedEvent(
    exchange: string,
    routingKey: string,
    payload: unknown,
    reason: string,
  ): Promise<void> {
    await this.failedEventModel.create({
      exchange,
      routingKey,
      payload,
      reason,
      createdAt: new Date(),
    });
    this.logger.warn('Event saved to failed_events collection');
  }
}

