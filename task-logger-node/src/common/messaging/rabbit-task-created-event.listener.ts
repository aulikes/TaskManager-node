import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../logger/app.logger';
import { TaskCreatedService } from '../../task/service/task-created.service';
import { RabbitMqListenerService } from './rabbitmq-listener.service';

import { BadRequestException } from '@nestjs/common';

/**
 * Listener que consume eventos de creación de tareas desde RabbitMQ.
 */
@Injectable()
export class TaskCreatedListener implements OnModuleInit {
  constructor(
    private readonly listenerService: RabbitMqListenerService,
    private readonly taskCreatedService: TaskCreatedService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Se ejecuta al inicializar el módulo y se conecta a la cola configurada.
   */
  async onModuleInit() {
    const { channel, queue } = await this.listenerService.connectToQueue('TASK_CREATED_QUEUE');

    channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const data = msg.content.toString();
        const payload = JSON.parse(data);

        this.logger.log('Received event: task.created', 'TaskCreatedListener');
        this.logger.log('Raw payload: ' + JSON.stringify(data), 'TaskCreatedListener');

        await this.taskCreatedService.saveEvent(payload);
        this.logger.log('Task event saved to MongoDB', 'TaskCreatedListener');
        channel.nack(msg, false, false);
      } catch (err) {
        if (err instanceof BadRequestException) {
          this.logger.warn('Error capturado: ' + err.message);
          channel.nack(msg, false, false);
        } // Duplicado: el evento ya se guardó antes
        else if (err.name === 'MongoServerError' && err.code === 11000) {
          channel.nack(msg, false, false);
          this.logger.warn('Duplicate event skipped', 'TaskCreatedListener');
        }
        else {
          // Otro error más grave
          this.logger.error('Failed to persist event to MongoDB', err);
          channel.nack(msg, false, false);
          return; // No hacemos ack -> RabbitMQ puede reintentar
        }
      }
    });
  }
}
