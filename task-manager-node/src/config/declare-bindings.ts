import { connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';

/**
 * Declara exchanges y colas necesarias para el sistema.
 * No configura DLQ porque el manejo de fallos es manual (persistencia en MongoDB).
 */
export async function declareRabbitBindings(config: ConfigService): Promise<void> {

  const uri = getRabbitMqUri(config); // Obtiene la URI de RabbitMQ desde la configuración
  const exchange = config.getOrThrow('RABBITMQ_EXCHANGE'); // Obtiene el nombre del exchange principal desde la configuración
  
  if (!exchange) throw new Error('RABBITMQ_EXCHANGE not defined in environment variables');

  try {
    // Establecer conexión con RabbitMQ
    const connection = await connect(uri);
    // Manejo de errores en la conexión
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error during declaration', err);
    });

    // Crear canal para declaración de bindings
    const channel = await connection.createChannel();
    // Manejo de errores en el canal
    channel.on('error', (err) => {
      console.error('RabbitMQ channel error during declaration', err);
    });

    // Declarar exchange de tipo 'topic' para enrutar por routing key
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // Configurar las colas principales con sus respectivas routing keys
    const bindings = [
      { queue: config.getOrThrow('TASK_CREATED_QUEUE'), key: config.getOrThrow('TASK_CREATED_ROUTING_KEY') },
      { queue: config.getOrThrow('TASK_UPDATED_QUEUE'), key: config.getOrThrow('TASK_UPDATED_ROUTING_KEY') },
      { queue: config.getOrThrow('TASK_DELETED_QUEUE'), key: config.getOrThrow('TASK_DELETED_ROUTING_KEY') },
    ];

    // Crear las colas principales y asociarlas al exchange principal
    for (const { queue, key } of bindings) {
      // Validación estricta: si falta algo, se lanza error
      if (!queue || !key) {
        throw new Error(`Missing queue or routing key in configuration: ${JSON.stringify({ queue, key })}`);
      }
      // Declara la cola (queue) en RabbitMQ, asegurando que sea durable.
      // 'durable: true' indica que la cola persiste incluso si RabbitMQ se reinicia.
      await channel.assertQueue(queue, { durable: true });
      // Enlaza la cola al exchange especificado usando una routing key.
      // Esto significa que cualquier mensaje publicado en el exchange con esa routing key
      // será enviado a esta cola.
      await channel.bindQueue(queue, exchange, key);
    }

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to declare RabbitMQ bindings:', error);
    throw error;
  }
}