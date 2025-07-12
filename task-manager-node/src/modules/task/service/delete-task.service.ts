import { Injectable, NotFoundException } from '@nestjs/common';
import { TaskEntity } from '../model/task.entity';
import { TaskDeletedEvent } from '../event/task-deleted.event';
import { PostgresTaskRepository } from '../repository/task.repository';
import { RabbitTaskDeletedEventPublisher } from '../../../common/messaging/rabbit-task-deleted-event.publisher';
import { AppLogger } from '../../../logger/app.logger';

@Injectable()
export class DeleteTaskService {
  constructor(
    private readonly repository: PostgresTaskRepository,        
    private readonly eventPublisher: RabbitTaskDeletedEventPublisher,
    private readonly logger: AppLogger,
  ) {}

  async execute(id: number): Promise<void> {
    try {
      const existingTask = await this.repository.findById(id);
      if (!existingTask) {
        throw new NotFoundException(`Task with ID ${id} not found`);
      }

      this.logger.log('Persistiendo en base de datos...');
      await this.repository.delete(id);

      this.logger.log(`Task ${id} deleted. Publishing event...`);
      await this.eventPublisher.publish(
        new TaskDeletedEvent(
          existingTask.id!,
          existingTask.title!,
          existingTask.description,
          existingTask.status,
          existingTask.createdAt
        )
      );
    } catch (error) {
      this.logger.error('Error al ejecutar DeleteTask:', error);
      throw error;
    }
  }
}
