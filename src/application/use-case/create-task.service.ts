import { Inject, Injectable } from '@nestjs/common';
import { Task } from '../../domain/entity/task.entity';
import { TaskCreatedEvent } from '../../domain/event/task-created.event';
import { CreateTaskCommand } from '../command/create-task.command';
import { TaskRepository, TaskRepositoryToken } from '../../domain/repository/task.repository';
import { TaskCreatedEventPublisher, TaskCreatedEventPublisherToken } from '../port/out/task-created-event.publisher';

@Injectable()
export class CreateTaskService {
  constructor(
    @Inject(TaskRepositoryToken)
    private readonly repository: TaskRepository,

    @Inject(TaskCreatedEventPublisherToken)
    private readonly eventPublisher: TaskCreatedEventPublisher,
  ) {}

  /**
   * Ejecuta la creación de una tarea a partir del comando de entrada.
   * El ID de la tarea es generado por la base de datos durante la persistencia.
   */
  async execute(command: CreateTaskCommand): Promise<Task> {
    // Crear entidad de dominio sin ID
    const task = Task.create(command.title, command.description);

    // Persistir y obtener entidad con ID generado por la base de datos
    const saved = await this.repository.save(task);

    // Publicar evento ahora que el ID ya existe
    await this.eventPublisher.publish(
      new TaskCreatedEvent(
        saved.id!,  // <- el ! asegura que no es undefined
        saved.title,
        saved.description,
        saved.status,
        saved.createdAt,
      )
    );

    return saved;
  }
}