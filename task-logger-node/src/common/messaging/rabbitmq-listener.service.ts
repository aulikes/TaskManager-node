import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../../logger/app.logger';
import { getRabbitMqUri } from '../../util/get-rabbitmq-uri';
import * as amqp from 'amqplib';

/**
 * Servicio genérico que establece la conexión a RabbitMQ y retorna canal y cola.
 */
@Injectable()
export class RabbitMqListenerService {
  constructor(
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Establece la conexión a RabbitMQ y retorna el canal y el nombre de la cola.
   * @param queueEnvKey Clave en el archivo .env que contiene el nombre de la cola
   */
  async connectToQueue(queueEnvKey: string): Promise<{
    connection: amqp.Connection;
    channel: amqp.Channel;
    queue: string;
  }> {
    const uri = getRabbitMqUri(this.config);
    const queue = this.config.getOrThrow<string>(queueEnvKey);

    const connection = await amqp.connect(uri);
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });

    this.logger.log(`Connected to queue: ${queue}`, 'RabbitMqListenerService');

    return { connection, channel, queue };
  }
}
