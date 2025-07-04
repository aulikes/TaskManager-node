import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskUpdatedEvent } from '../task/event/task-updated.event';
import { AppLogger } from '../logger/app.logger';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';

@Injectable()
export class RabbitTaskUpdatedEventPublisher {
  constructor(
    private readonly publisher: RabbitMQPublisherService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) { }

  async publish(event: TaskUpdatedEvent): Promise<void> {
    const exchange = this.config.getOrThrow('RABBITMQ_EXCHANGE'); // task.events
    const routingKey = this.config.getOrThrow('TASK_UPDATED_ROUTING_KEY'); // task.created
    const payload = { ...event };

    this.logger.log(`Publishing task.updated event: ${JSON.stringify(payload)}`);
    await this.publisher.publish(exchange, routingKey, payload);
  }
}
