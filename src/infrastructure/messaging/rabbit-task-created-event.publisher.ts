import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskCreatedEventPublisher } from '../../application/port/out/task-created-event.publisher';
import { TaskCreatedEvent } from '../../domain/event/task-created.event';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitTaskCreatedEventPublisher implements TaskCreatedEventPublisher, OnModuleInit {
  private readonly logger = new Logger(RabbitTaskCreatedEventPublisher.name);
  private channel: amqp.Channel;
  private connection: amqp.Connection;

  constructor(private readonly config: ConfigService) {}

  async onModuleInit() {
    const uri = `amqp://${this.config.get('RABBITMQ_USER')}:${this.config.get('RABBITMQ_PASSWORD')}@${this.config.get('RABBITMQ_HOST')}:${this.config.get('RABBITMQ_PORT')}`;
    this.connection = await amqp.connect(uri);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange('task.events', 'topic', { durable: true });
  }

  async publish(event: TaskCreatedEvent): Promise<void> {
    const payload = JSON.stringify(event);
    this.channel.publish('task.events', 'task.created', Buffer.from(payload), {
      contentType: 'application/json',
    });
    this.logger.log(`Published event to RabbitMQ: task.created`);
  }
}
