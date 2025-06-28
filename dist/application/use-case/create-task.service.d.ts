import { Task } from '../../domain/entity/task.entity';
import { CreateTaskCommand } from '../command/create-task.command';
import { TaskRepository } from '../../domain/repository/task.repository';
import { TaskCreatedEventPublisher } from '../port/out/task-created-event.publisher';
export declare class CreateTaskService {
    private readonly repository;
    private readonly eventPublisher;
    constructor(repository: TaskRepository, eventPublisher: TaskCreatedEventPublisher);
    execute(command: CreateTaskCommand): Promise<Task>;
}
