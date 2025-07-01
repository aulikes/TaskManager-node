import { connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';

/**
 * Declara exchange, colas y sus bindings en RabbitMQ
 */
export async function declareRabbitBindings(config: ConfigService): Promise<void> {
  const uri = getRabbitMqUri(config);
  const exchange = config.getOrThrow('RABBITMQ_EXCHANGE');
  const connection = await connect(uri);
  const channel = await connection.createChannel();

  await channel.assertExchange(exchange, 'topic', { durable: true });

  const bindings = [
    { queue: config.get('TASK_CREATED_QUEUE'), key: config.get('TASK_CREATED_ROUTING_KEY') },
    { queue: config.get('TASK_UPDATED_QUEUE'), key: config.get('TASK_UPDATED_ROUTING_KEY') },
    { queue: config.get('TASK_DELETED_QUEUE'), key: config.get('TASK_DELETED_ROUTING_KEY') },
  ];

  for (const { queue, key } of bindings) {
    if (queue && key) {
      await channel.assertQueue(queue, { durable: true });
      await channel.bindQueue(queue, exchange, key);
    }
  }

  await channel.close();
  await connection.close();
}