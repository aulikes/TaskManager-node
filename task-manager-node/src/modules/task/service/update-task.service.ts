import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskEntity } from '../model/task.entity';
import { TaskUpdatedEvent, TaskState } from '../event/task-updated.event';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { PostgresTaskRepository } from '../repository/task.repository';
import { RabbitTaskUpdatedEventPublisher } from '../../../common/messaging/rabbit-task-updated-event.publisher';
import { AppLogger } from '../../../logger/app.logger';
import { DomainException } from '../../../common/exceptions/domain-exception';

@Injectable()
export class UpdateTaskService {
  constructor(
    private readonly repository: PostgresTaskRepository,
    private readonly eventPublisher: RabbitTaskUpdatedEventPublisher,
    private readonly logger: AppLogger,
  ) {}

  async execute(id: number, dto: UpdateTaskDto): Promise<TaskEntity> {
    try {
      // Buscar la tarea por ID
      const existingTask = await this.repository.findById(id);
      if (!existingTask) {
        // Lanzar excepción si no existe
        throw new NotFoundException(`Task with ID ${id} not found`);
      }
      const before = { ...existingTask }; // Creamos una copia superficial independiente con las mismas propiedades

      Object.assign(existingTask, dto); // Copiamos las propiedades del DTO al objeto existente

      // Verificar si hubo realmente un cambio (evitar update redundante)
      if (
        before.title === existingTask.title &&
        before.description === existingTask.description &&
        before.status === existingTask.status
      ) {
        // Si no cambió nada relevante, lanzar excepción de dominio
        throw new DomainException(
          'No fields have changed from the previous state',
          'TASK_UPDATE_NO_CHANGES',
          400,
        );
      }

      // Guardar los cambios en base de datos
      this.logger.log('Persistiendo en base de datos...');
      const after = await this.repository.save(existingTask);

      // Publicar el evento de actualización
      this.logger.log('Preparando para publicar evento...');
      const event = new TaskUpdatedEvent(
        new TaskState(before.id, before.title, before.description, before.status, before.createdAt),
        new TaskState(after.id, after.title, after.description, after.status, after.createdAt),
      );
      await this.eventPublisher.publish(event);

      this.logger.log('Task publicada exitosamente.');
      return after;
    } catch (error) {
      // Si es una excepción de dominio conocida, simplemente relanza
      if (error instanceof DomainException || error instanceof NotFoundException) {
        this.logger.warn(`Excepción conocida: ${error.message}`);
        throw error;
      }

      // Para cualquier otra excepción inesperada, loguea como error crítico
      this.logger.error('Error inesperado al ejecutar UpdateTask', error);
      throw new DomainException(
        'Unexpected error while updating task',
        'TASK_UPDATE_FAILURE',
        500
      );
    }
  }
}
