import { Injectable, OnModuleInit } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { AppLogger } from '../../logger/app.logger';
import { TaskCreatedEventDto } from '../../controller/dto/task-created-event.dto';
import { TaskCreatedService } from '../../task/task-created.service';
import { TaskCreatedEvent, TaskCreatedEventDocument } from '../../task/task-created-event.schema';
import { RabbitMqListenerService } from '../../messaging/rabbitmq/rabbitmq-listener.service';


// Funciones de class-validator y class-transformer
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

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

      let idEvent = "";
      try {
        const data = msg.content.toString();
        const payload = JSON.parse(data);

        this.logger.log('Received event: task.created');
        this.logger.debug('Raw payload: ' + JSON.stringify(data));

        // Convertir el objeto plano recibido a una instancia del DTO
        const dto = plainToInstance(TaskCreatedEventDto, payload);
        // Validar el DTO según las reglas declaradas en TaskCreatedEventDto
        const errors = await validate(dto);

        if (errors.length > 0) {
          this.logger.warn('Validation failed for TaskCreatedEvent');
          this.logger.error('Validation failed for TaskCreatedEvent', JSON.stringify(errors));
          channel.ack(msg);
          return;
        }

        // Si pasa la validación, registrar logs estructurados
        this.logger.log('DTO validated successfully');
        this.logger.debug('Validated DTO: ' + JSON.stringify(dto));

        idEvent = dto.id;
        // Guarda en MONGO DB
        const taskEvent: TaskCreatedEvent = {
          id: dto.id,
          title: dto.title,
          description: dto.description,
          status: dto.status
        };
        await this.taskCreatedService.saveEvent(taskEvent);
        this.logger.log('Task event saved to MongoDB', 'TaskCreatedListener');
        channel.ack(msg);
      } catch (err) {
        // Duplicado: el evento ya se guardó antes
        if (err.name === 'MongoServerError' && err.code === 11000) {
          channel.nack(msg, false, false);
          this.logger.warn(`Duplicate event skipped (id: ${idEvent})`);
        } else {
          // Otro error más grave
          this.logger.error('Failed to persist event to MongoDB', err);
          return; // No hacemos ack -> RabbitMQ puede reintentar
        }
      }
    });
  }
}
