import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../logger/app.logger';
import { RabbitMqListenerService } from './rabbitmq-listener.service';
import { FailedTaskEventService } from '../failed-event/failed-event.service';

@Injectable()
export class RabbitFailedTaskEventListener implements OnModuleInit {
  constructor(
    private readonly listenerService: RabbitMqListenerService,
    private readonly failedEventService: FailedTaskEventService,
    private readonly logger: AppLogger,
  ) {}

  async onModuleInit() {
    const { channel, queue } = await this.listenerService.connectToQueue('TASK_FAILED_QUEUE');

    channel.consume(queue, async (msg) => {
      if (!msg) return;

      try {
        const content = msg.content.toString();
        const payload = JSON.parse(content);

        await this.failedEventService.saveEvent({
          originalQueue: queue,
          routingKey: msg.fields.routingKey,
          payload,
          error: 'Message routed to DLQ',
        });

        this.logger.warn(`Persisted failed event from DLQ: ${JSON.stringify(payload)}`);
        channel.ack(msg);
      } catch (err) {
        this.logger.error('Failed to process DLQ message', err);
        channel.nack(msg, false, false); // No reintentar
      }
    });
  }
}
