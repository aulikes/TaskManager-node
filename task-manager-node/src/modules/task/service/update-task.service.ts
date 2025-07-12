import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskEntity } from '../model/task.entity';
import { TaskUpdatedEvent, TaskState } from '../event/task-updated.event';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { PostgresTaskRepository } from '../repository/task.repository';
import { RabbitTaskUpdatedEventPublisher } from '../../../common/messaging/rabbit-task-updated-event.publisher';
import { AppLogger } from '../../../logger/app.logger';

@Injectable()
export class UpdateTaskService {
  constructor(
    private readonly repository: PostgresTaskRepository,
    private readonly eventPublisher: RabbitTaskUpdatedEventPublisher,
    private readonly logger: AppLogger,
  ) {}

  async execute(id: number, dto: UpdateTaskDto): Promise<TaskEntity> {
    try {
      const existingTask = await this.repository.findById(id);
      if (!existingTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      const before = { ...existingTask }; // Creamos una copia superficial independiente con las mismas propiedades

      Object.assign(existingTask, dto); // Copiamos las propiedades del DTO al objeto existente

      this.logger.log('Persistiendo en base de datos...');
      const after = await this.repository.save(existingTask);

      this.logger.log('Preparando para publicar evento...');
      const event = new TaskUpdatedEvent(
        new TaskState(before.id, before.title, before.description, before.status, before.createdAt),
        new TaskState(after.id, after.title, after.description, after.status, after.createdAt),
      );
      await this.eventPublisher.publish(event);

      this.logger.log('Task publicada exitosamente.');
      return after;
    } catch (error) {
      this.logger.error('Error al ejecutar UpdateTask:', error);
      throw error;
    }
  }
}
