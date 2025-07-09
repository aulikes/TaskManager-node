import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/app.logger';
import { connect, ConfirmChannel, Connection } from 'amqplib';
import { getRabbitMqUri } from '../../util/get-rabbitmq-uri';
import { retryWithTimeout } from '../../util/retry-with-timeout.util';
import { getClassMethodContextLabel } from '../../util/get-class-method-context-label.util';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedEvent, FailedEventDocument } from '../schema/failed-event.schema';


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
    this.channel = await this.connection.createConfirmChannel();
    this.logger.log('RabbitMQ confirm channel created for publishing');
  }

  /**
   * Publica un mensaje al exchange usando retry + timeout por intento.
   * @param exchange Nombre del exchange
   * @param routingKey Routing key del mensaje
   * @param payload Cuerpo del mensaje
   */
  async publish(exchange: string, routingKey: string, payload: any): Promise<void> {
    if (!this.channel) throw new Error('RabbitMQ channel not initialized');

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
          }),
        this.config,
        this.logger,
        getClassMethodContextLabel(this),
      );
      this.logger.log('Message published successfully');
    } catch (error) {
      this.logger.error(`Publish failed after retries: ${error.message}`);

      // Persistir en MongoDB para DLQ manual
      await this.failedEventModel.create({
        exchange,
        routingKey,
        payload,
        reason: error.message,
      });

      this.logger.warn('Event saved to failed_events collection');
      // Aquí podrías emitir una alerta o lanzar una excepción controlada si lo deseas
    }
  }
}

