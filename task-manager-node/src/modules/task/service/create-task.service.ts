import { Injectable } from '@nestjs/common';
import { TaskEntity } from '../model/task.entity';
import { TaskStatus } from '../model/task-status.enum';
import { TaskCreatedEvent } from '../event/task-created.event';
import { CreateTaskDto } from '../dto/create-task.dto';
import { PostgresTaskRepository } from '../repository/task.repository';
import { RabbitTaskCreatedEventPublisher } from '../../../common/messaging/rabbit-task-created-event.publisher';
import { AppLogger } from '../../../logger/app.logger';
import { DomainException } from '../../../common/exceptions/domain.exception';
import { MetricsService } from '../../../metrics/metrics.service'; // Importa la métrica

@Injectable()
export class CreateTaskService {
  constructor(
    private readonly repository: PostgresTaskRepository,
    private readonly eventPublisher: RabbitTaskCreatedEventPublisher,
    private readonly logger: AppLogger,
    private readonly metricsService: MetricsService, // para métricas
  ) {}

  /**
   * Ejecuta la creación de una tarea a partir del comando de entrada.
   * El ID de la tarea es generado por la base de datos durante la persistencia.
   */
  async execute(dto: CreateTaskDto): Promise<TaskEntity> {
    try {
      this.logger.log('Verificando si ya existe una tarea con el mismo título...');
      const existing = await this.repository.findByTitle(dto.title);
      if (existing) {
        this.logger.warn(`Tarea duplicada: ya existe una con título "${dto.title}"`);
        
        // Incrementa métrica 
        this.metricsService.tasksCreatedDuplicatedCounter.inc();

        throw new DomainException(
          'A task with this title already exists',
          'TASK_ALREADY_EXISTS',
          409,
        );
      }
      this.logger.log('Creando entidad de Task...');
      const task = new TaskEntity();
      task.title = dto.title;
      task.description = dto.description;
      task.status = TaskStatus.PENDING;
      task.createdAt = new Date();

      this.logger.log('Persistiendo en base de datos...');
      const saved = await this.repository.save(task);

      this.logger.log('Preparando para publicar evento de la entidad...');
      await this.eventPublisher.publish(
        new TaskCreatedEvent(
          saved.id!,
          saved.title!,
          saved.description,
          saved.status,
          saved.createdAt
        )
      );

      // Incrementa métrica 
      this.metricsService.tasksCreatedCounter.inc();

      return saved;

    } catch (error) {
      if (error instanceof DomainException) {
        this.logger.warn(`Error de dominio: ${error.message}`);
        throw error;
      }

      // Incrementa métrica 
      this.metricsService.tasksCreatedErrorCounter.inc();

      this.logger.error('Error inesperado al ejecutar CreateTask:', error);
      throw new DomainException(
        'Unexpected error while creating task',
        'TASK_CREATE_FAILURE',
        500,
      );
    }
  }
}