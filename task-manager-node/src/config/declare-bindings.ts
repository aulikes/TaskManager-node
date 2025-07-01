import { connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../infrastructure/util/get-rabbitmq-uri';

/**
 * Se asegura de declarar el exchange necesario en RabbitMQ.
 * Esto evita que emit() falle silenciosamente si el exchange no existe.
 */
export async function declareRabbitBindings(config: ConfigService): Promise<void> {
  const uri = getRabbitMqUri(config);
  const exchange = config.getOrThrow('RABBITMQ_EXCHANGE');
  const routingKey = config.getOrThrow('TASK_CREATED_ROUTING_KEY');

  const connection = await connect(uri);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });

  await channel.close();
  await connection.close();
}
