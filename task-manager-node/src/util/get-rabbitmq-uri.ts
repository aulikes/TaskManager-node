import { ConfigService } from '@nestjs/config';

/**
 * Genera la URI de conexión a RabbitMQ a partir de variables de entorno.
 */
export function getRabbitMqUri(config: ConfigService): string {
  const user = config.getOrThrow<string>('RABBITMQ_USER');
  const password = config.getOrThrow<string>('RABBITMQ_PASSWORD');
  const host = config.getOrThrow<string>('RABBITMQ_HOST');
  const port = config.getOrThrow<number>('RABBITMQ_PORT');

  if (!user || !password || !host || !port) {
    throw new Error('RabbitMQ configuration is invalid or incomplete');
  }

  return `amqp://${user}:${password}@${host}:${port}`;
}
