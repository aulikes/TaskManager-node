import { ConfigService } from '@nestjs/config';
import { RmqOptions, Transport } from '@nestjs/microservices';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';

/**
 * Devuelve la configuración de RabbitMQ para una cola específica.
 * Esta configuración permite que NestJS enrute correctamente los eventos
 * incluso si no se especifica un "pattern" explícito dentro del mensaje.
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
      noAck: false
    },
  };
}

