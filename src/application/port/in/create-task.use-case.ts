import { Task } from '../../../domain/entity/task.entity';
import { CreateTaskCommand } from '../../command/create-task.command';

export const CreateTaskUseCaseToken = Symbol('CreateTaskUseCase');

export interface CreateTaskUseCase {
  execute(command: CreateTaskCommand): Promise<Task>;
}