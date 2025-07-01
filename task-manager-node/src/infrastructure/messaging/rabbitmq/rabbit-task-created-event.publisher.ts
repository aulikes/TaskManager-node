import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskCreatedEventPublisher } from '../../../application/port/out/task-created-event.publisher';
import { TaskCreatedEvent } from '../../../domain/event/task-created.event';
import { AppLogger } from '../../../logger/app.logger';
import { RabbitMQService } from './rabbitmq.service';
import { ConfirmChannel } from 'amqplib';

@Injectable()
export class RabbitTaskCreatedEventPublisher implements TaskCreatedEventPublisher, OnModuleInit {
  private channel: ConfirmChannel;

  constructor(
    private readonly rabbitService: RabbitMQService,
    private readonly config: ConfigService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Se ejecuta al iniciar el módulo y obtiene un canal de confirmación configurado
   */
  async onModuleInit() {
    try {
      this.channel = await this.rabbitService.getConfirmChannel('RABBITMQ_EXCHANGE');
    } catch (err) {
      this.logger.error('Failed to initialize RabbitMQ channel for publisher', err);
    }
  }

  /**
   * Publica un evento de tarea creada al exchange configurado
   */
  async publish(event: TaskCreatedEvent): Promise<void> {
    const exchange = this.config.getOrThrow<string>('RABBITMQ_EXCHANGE');
    const routingKey = this.config.getOrThrow<string>('TASK_CREATED_ROUTING_KEY');
    const payload = JSON.stringify(event);

    if (!this.channel) {
      this.logger.error('RabbitMQ channel is not initialized. Skipping publish.');
      return;
    }

    this.logger.log("Publishing task.created event to " + exchange + " with routing key " + routingKey);
    this.logger.debug(payload, 'RabbitTaskCreatedEventPublisher');

    this.channel.publish(
      exchange,
      routingKey,
      Buffer.from(payload),
      { contentType: 'application/json' },
      (err, ok) => {
        if (err) {
          this.logger.error('Failed to confirm publication of task.created event', err);
        } else {
          this.logger.log('task.created event published successfully');
        }
      },
    );
  }
}