import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../../domain/repository/task.repository';
import { Task } from '../../domain/entity/task.entity';
import { TaskStatus } from '../../domain/enum/task-status.enum';
import { CreateTaskCommand } from '../command/create-task.command';
import { CreateTaskUseCase } from '../port/in/create-task.use-case';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateTaskService implements CreateTaskUseCase {
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(command: CreateTaskCommand): Promise<Task> {
    const task = new Task(
      uuidv4(),
      command.title,
      command.description ?? null,
      TaskStatus.PENDING,
      new Date()
    );
    await this.taskRepository.save(task);
    return task;
  }
}