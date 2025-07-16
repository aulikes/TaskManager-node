import { Injectable, OnModuleInit } from '@nestjs/common';
import { AppLogger } from '../../logger/app.logger';
import { TaskDeletedService } from '../../task/service/task-deleted.service';
import { RabbitMqListenerService } from './rabbitmq-listener.service';

import { BadRequestException } from '@nestjs/common';

/**
 * Listener que escucha eventos de eliminación de tareas desde RabbitMQ.
 */
@Injectable()
export class TaskDeletedListener implements OnModuleInit {
  constructor(
    private readonly listenerService: RabbitMqListenerService,
    private readonly taskDeletedService: TaskDeletedService,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Se ejecuta al inicializar el módulo y se conecta a la cola 'TASK_DELETED_QUEUE'
   */
  async onModuleInit() {
    const { channel, queue } = await this.listenerService.connectToQueue('TASK_DELETED_QUEUE');

    channel.consume(queue, async (msg) => {
      if (!msg) return;
      try {
        const data = msg.content.toString();
        const payload = JSON.parse(data);

        this.logger.log('Received event: task.updated');
        this.logger.log('Raw payload: ' + JSON.stringify(data));

        await this.taskDeletedService.saveEvent(payload);
        this.logger.log('Task updated event saved to MongoDB', 'TaskDeletedService');
        channel.ack(msg);
      } catch (err) {
        if (err instanceof BadRequestException) {
          this.logger.warn('Error capturado: ' + err.message);
          channel.ack(msg);
        } // Duplicado: el evento ya se guardó antes
        else if (err.name === 'MongoServerError' && err.code === 11000) {
          channel.nack(msg, false, false);
          this.logger.warn('Duplicate event skipped', 'TaskCreatedListener');
        }
        else {
          // Otro error más grave
          this.logger.error('Failed to persist event to MongoDB', err);
          return; // No hacemos ack -> RabbitMQ puede reintentar
        }
      }
    });
  }
}
