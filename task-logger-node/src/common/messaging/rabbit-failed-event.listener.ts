import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../logger/app.logger';
import { RabbitMqListenerService } from './rabbitmq-listener.service';
import { FailedTaskEventService } from '../failed-event/failed-event.service';
import { FailedEventDto } from '../failed-event/failed-event.dto';

@Injectable()
export class FailedTaskEventListener implements OnModuleInit {
  constructor(
    private readonly listenerService: RabbitMqListenerService,
    private readonly failedEventService: FailedTaskEventService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    try {
      const { channel, queue } = await this.listenerService.connectToQueue('TASK_DLQ');
      this.logger.log(`Escuchando mensajes en la cola DLQ: ${queue}`, 'FailedTaskEventListener');

      await channel.consume(
        queue,
        async (msg) => {
          if (!msg) return;

          try {
            const content = msg.content.toString();
            const payload = JSON.parse(content);

            // Extraer el error si fue enviado como header (puede que no siempre esté)
            const headers = msg.properties.headers || {};
            const deadLetterInfo = headers['x-death']?.[0]; // RabbitMQ pone metadatos de muerte aquí
    
            const xDeath = headers['x-death']?.[0];
            const originalQueue = xDeath?.queue || 'unknown-queue';
            const originalRoutingKey = xDeath?.['routing-keys']?.[0] || msg.fields.routingKey || 'unknown-key';
            const reason = xDeath?.reason || 'Unknown reason routed to DLQ';

            // Construcción del DTO con todos los campos esperados
            const failedEvent: FailedEventDto = {
              originalQueue: originalQueue,
              routingKey: originalRoutingKey,
              payload: payload,
              error: reason,
            };

            await this.failedEventService.saveEvent(failedEvent);

            this.logger.log(
              `Evento fallido persistido desde la DLQ: ${JSON.stringify(payload)}`,
              'FailedTaskEventListener',
            );

            channel.ack(msg);
          } catch (err) {
            this.logger.error('Error procesando mensaje de la DLQ', err);
            channel.nack(msg, false, false); // No reintentar
          }
        },
        { noAck: false } // Asegura confirmación manual
      );
    } catch (error) {
      this.logger.error('Error inicializando listener de DLQ', error);
      throw error;
    }
  }
}
