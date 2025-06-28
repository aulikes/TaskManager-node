import { Repository } from 'typeorm';
import { TaskRepository } from '../../../domain/repository/task.repository';
import { Task } from '../../../domain/entity/task.entity';
import { TaskOrmEntity } from '../model/task.orm-entity';
export declare class PostgresTaskRepository implements TaskRepository {
    private readonly ormRepo;
    constructor(ormRepo: Repository<TaskOrmEntity>);
    save(task: Task): Promise<Task>;
    findById(id: number): Promise<Task | null>;
    findAll(): Promise<Task[]>;
    delete(id: string): Promise<void>;
    private toOrm;
    private toDomain;
}
