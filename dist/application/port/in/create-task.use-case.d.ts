import { Task } from '../../../domain/entity/task.entity';
import { CreateTaskCommand } from '../../command/create-task.command';
export declare const CreateTaskUseCaseToken: unique symbol;
export interface CreateTaskUseCase {
    execute(command: CreateTaskCommand): Promise<Task>;
}
