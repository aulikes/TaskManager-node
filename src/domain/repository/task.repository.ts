import { Task } from '../entity/task.entity';

export const TaskRepositoryToken = Symbol('TaskRepository');

export interface TaskRepository {
  save(task: Task): Promise<Task>;
  findById(id: number): Promise<Task | null>;
  findAll(): Promise<Task[]>;
  delete(id: string): Promise<void>;
}
