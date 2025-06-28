import { Task } from '../entity/task.entity';
export declare const TaskRepositoryToken: unique symbol;
export interface TaskRepository {
    save(task: Task): Promise<Task>;
    findById(id: number): Promise<Task | null>;
    findAll(): Promise<Task[]>;
    delete(id: string): Promise<void>;
}
