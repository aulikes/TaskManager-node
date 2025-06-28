import { CreateTaskUseCase } from '../../../application/port/in/create-task.use-case';
import { CreateTaskDto } from '../dto/create-task.dto';
import { Task } from '../../../domain/entity/task.entity';
export declare class TaskController {
    private readonly createTaskUseCase;
    constructor(createTaskUseCase: CreateTaskUseCase);
    create(dto: CreateTaskDto): Promise<Task>;
}
