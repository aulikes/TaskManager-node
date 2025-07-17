import { connect } from 'amqplib';
import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../util/get-rabbitmq-uri';

/**
 * Declara exchanges, colas y sus bindings, incluyendo configuración de DLQ
 */
export async function declareRabbitBindings(config: ConfigService): Promise<void> {

  const uri = getRabbitMqUri(config); // Obtiene la URI de RabbitMQ desde la configuración
  const exchange = config.getOrThrow('RABBITMQ_EXCHANGE'); // Obtiene el nombre del exchange principal desde la configuración
  const dlqExchange = config.getOrThrow('DLQ_EXCHANGE'); // Obtiene el nombre del exchange de la DLQ desde la configuración

  // Declarar colas DLQ
  const dlqQueue = config.getOrThrow('TASK_DLQ'); // Obtiene el nombre de la cola DLQ desde la configuración
  const dlqRoutingKey = config.getOrThrow('TASK_DLQ_ROUTING_KEY'); // Routing key usada para mensajes fallidos (usualmente se ignora si es fanout)

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

    // Declarar exchange principal de tipo 'topic' para enrutar por routing key
    await channel.assertExchange(exchange, 'topic', { durable: true });

    // Declarar exchange de la DLQ (tipo fanout o direct)
    await channel.assertExchange(dlqExchange, 'fanout', { durable: true });
  
    // Declarar cola DLQ donde llegarán los mensajes fallidos
    await channel.assertQueue(dlqQueue, { durable: true });
    // Enlazar la cola DLQ al exchange de la DLQ
    await channel.bindQueue(dlqQueue, dlqExchange, dlqRoutingKey);

    // Configurar las colas principales con sus respectivas routing keys
    const bindings = [
      { queue: config.get('TASK_CREATED_QUEUE'), key: config.getOrThrow('TASK_CREATED_ROUTING_KEY') },
      { queue: config.get('TASK_UPDATED_QUEUE'), key: config.getOrThrow('TASK_UPDATED_ROUTING_KEY') },
      { queue: config.get('TASK_DELETED_QUEUE'), key: config.getOrThrow('TASK_DELETED_ROUTING_KEY') },
    ];

    // Crear las colas principales y asociarlas al exchange principal
    // Además, asignar la DLQ mediante el argumento 'x-dead-letter-exchange'
    for (const { queue, key } of bindings) {
      // Validación estricta: si falta algo, se lanza error
      if (!queue || !key) {
        throw new Error(`Missing queue or routing key in configuration: ${JSON.stringify({ queue, key })}`);
      }
      // Declarar la cola principal con la configuración de DLQ
      // 'durable: true' indica que la cola persiste incluso si RabbitMQ se reinicia.
      await channel.assertQueue(queue, {
        durable: true,
        arguments: {
          // Esto indica que si hay error en esta cola, el mensaje irá a la DLQ
          'x-dead-letter-exchange': dlqExchange,
          'x-dead-letter-routing-key': dlqRoutingKey,
        },
      });

      // Enlazar la cola con su routing key al exchange principal
      await channel.bindQueue(queue, exchange, key);
    }

    // Cerrar el canal y la conexión
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Failed to declare RabbitMQ bindings:', error);
    throw error;
  }
}