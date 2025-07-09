import { Injectable } from '@nestjs/common';
import { TaskEntity } from '../model/task.entity';
import { TaskStatus } from '../model/task-status.enum';
import { TaskCreatedEvent } from '../event/task-created.event';
import { CreateTaskDto } from '../dto/create-task.dto';
import { PostgresTaskRepository } from '../repository/task.repository';
import { RabbitTaskCreatedEventPublisher } from '../../common/messaging/rabbit-task-created-event.publisher';
import { AppLogger } from '../../logger/app.logger';

@Injectable()
export class CreateTaskService {
  constructor(
    private readonly repository: PostgresTaskRepository,
    private readonly eventPublisher: RabbitTaskCreatedEventPublisher,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Ejecuta la creación de una tarea a partir del comando de entrada.
   * El ID de la tarea es generado por la base de datos durante la persistencia.
   */
  async execute(dto: CreateTaskDto): Promise<TaskEntity> {
    try {
      this.logger.log('Creando entidad de Task...');
      const task = new TaskEntity();
      task.title = dto.title;
      task.description = dto.description;
      task.status = TaskStatus.PENDING;
      task.createdAt = new Date();

      this.logger.log('Persistiendo en base de datos...');
      const saved = await this.repository.save(task);

      this.logger.log('Preparando para publicar evento de la entidad...' + saved);
      await this.eventPublisher.publish(
        new TaskCreatedEvent(
          saved.id!,
          saved.title!,
          saved.description,
          saved.status,
          saved.createdAt
        )
      );

      this.logger.log('Task publicada exitosamente.');
      return saved;

    } catch (error) {
      this.logger.error('Error al ejecutar el caso de uso CreateTask:', error);
      throw error;
    }
  }
}