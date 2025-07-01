import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../domain/entity/task.entity';
import { TaskCreatedEvent } from '../../domain/event/task-created.event';
import { CreateTaskCommand } from '../command/create-task.command';
import { TaskRepository, TaskRepositoryToken } from '../../domain/repository/task.repository';
import { TaskCreatedEventPublisher, TaskCreatedEventPublisherToken } from '../port/out/task-created-event.publisher';
import { AppLogger } from '../../logger/app.logger';

@Injectable()
export class CreateTaskService {
  constructor(
    @Inject(TaskRepositoryToken)
    private readonly repository: TaskRepository,

    @Inject(TaskCreatedEventPublisherToken)
    private readonly eventPublisher: TaskCreatedEventPublisher,

    private readonly logger: AppLogger,
  ) {}

  /**
   * Ejecuta la creación de una tarea a partir del comando de entrada.
   * El ID de la tarea es generado por la base de datos durante la persistencia.
   */
  async execute(command: CreateTaskCommand): Promise<Task> {
    try {
      this.logger.log('Creando entidad de dominio...');
      const task = Task.create(command.title, command.description);

      this.logger.log('Persistiendo en base de datos...');
      const saved = await this.repository.save(task);

      this.logger.log('Preparando para publicar evento...');
      await this.eventPublisher.publish(
        new TaskCreatedEvent(
          saved.id!,
          saved.title,
          saved.description,
          saved.status,
          saved.createdAt
        )
      );

      this.logger.log('Tarea creada exitosamente.');
      return saved;

    } catch (error) {
      this.logger.error('Error al ejecutar el caso de uso CreateTask:', error);
      throw error;
    }
  }
}