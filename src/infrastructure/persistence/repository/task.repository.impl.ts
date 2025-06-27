import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskRepository } from '../../../domain/repository/task.repository';
import { Task } from '../../../domain/entity/task.entity';
import { TaskStatus } from '../../../domain/enum/task-status.enum';
import { TaskOrmEntity } from '../model/task.orm-entity';
import { TaskStatusOrm } from '../model/task-status.orm';

@Injectable()
export class PostgresTaskRepository implements TaskRepository {
  constructor(
    @InjectRepository(TaskOrmEntity)
    private readonly ormRepo: Repository<TaskOrmEntity>
  ) {}

  async save(task: Task): Promise<void> {
    const ormEntity = this.toOrm(task);
    await this.ormRepo.save(ormEntity);
  }

  async findById(id: string): Promise<Task | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  async findAll(): Promise<Task[]> {
    const ormList = await this.ormRepo.find();
    return ormList.map(this.toDomain);
  }

  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toOrm(task: Task): TaskOrmEntity {
    const orm = new TaskOrmEntity();
    orm.id = task.id;
    orm.title = task.title;
    orm.description = task.description ?? '';
    orm.status = TaskStatusOrm[task.status];
    orm.createdAt = task.createdAt;
    return orm;
  }

  private toDomain(orm: TaskOrmEntity): Task {
    return new Task(
      orm.id,
      orm.title,
      orm.description,
      TaskStatus[orm.status],
      orm.createdAt
    );
  }
}