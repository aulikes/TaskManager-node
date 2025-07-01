import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { getRabbitMqUri } from '../infrastructure/util/get-rabbitmq-uri';

/**
 * Devuelve la configuración de RabbitMQ para una cola específica
 */
export function getRabbitMqConfig(config: ConfigService, queueEnvKey: string): RmqOptions {
  const uri = getRabbitMqUri(config);
  return {
    transport: Transport.RMQ,
    options: {
      urls: [uri],
      queue: config.getOrThrow(queueEnvKey),
      queueOptions: {
        durable: true,
      },
      noAck: false,
      persistent: true,
    },
  };
}
