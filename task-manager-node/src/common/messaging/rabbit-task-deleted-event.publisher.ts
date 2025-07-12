import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskDeletedEvent } from '../../modules/task/event/task-deleted.event';
import { AppLogger } from '../../logger/app.logger';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';

@Injectable()
export class RabbitTaskDeletedEventPublisher {
  constructor(
    private readonly publisher: RabbitMQPublisherService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) { }

  async publish(event: TaskDeletedEvent): Promise<void> {
    const exchange = this.config.getOrThrow('RABBITMQ_EXCHANGE'); // task.events
    const routingKey = this.config.getOrThrow('TASK_DELETED_ROUTING_KEY'); // task.created
    const payload = { ...event };

    this.logger.log(`Publishing task.deleted event: ${JSON.stringify(payload)}`);
    await this.publisher.publish(exchange, routingKey, payload);
  }
}
