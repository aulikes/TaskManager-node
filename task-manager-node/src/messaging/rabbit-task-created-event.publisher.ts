import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskCreatedEvent } from '../task/event/task-created.event';
import { AppLogger } from '../logger/app.logger';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';

@Injectable()
export class RabbitTaskCreatedEventPublisher {
  constructor(
    private readonly publisher: RabbitMQPublisherService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  async publish(event: TaskCreatedEvent): Promise<void> {
    const exchange = this.config.getOrThrow('RABBITMQ_EXCHANGE'); // task.events
    const routingKey = this.config.getOrThrow('TASK_CREATED_ROUTING_KEY'); // task.created
    const payload = { ...event };

    this.logger.log(`Publishing task.created event: ${JSON.stringify(payload)}`);
    await this.publisher.publish(exchange, routingKey, payload);
  }
}
