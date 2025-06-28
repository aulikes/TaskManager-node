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

  /**
   * Guarda una entidad Task en la base de datos.
   * Retorna la entidad ya persistida, con el ID generado por el motor de BD.
   */
  async save(task: Task): Promise<Task> {
    // Convertimos la entidad de dominio a su forma persistente (ORM)
    const ormEntity = this.toOrm(task);

    // Guardamos y obtenemos la entidad resultante desde la base de datos
    const persisted = await this.ormRepo.save(ormEntity);

    // Convertimos la entidad guardada (con ID generado) de vuelta a dominio
    return this.toDomain(persisted);
  }

  /**
   * Busca una tarea por su ID. Devuelve una entidad de dominio si se encuentra, o null si no.
   */
  async findById(id: number): Promise<Task | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm ? this.toDomain(orm) : null;
  }

  /**
   * Obtiene todas las tareas guardadas en la base de datos.
   */
  async findAll(): Promise<Task[]> {
    const ormList = await this.ormRepo.find();
    return ormList.map(this.toDomain);
  }

  /**
   * Elimina una tarea de la base de datos por ID.
   */
  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }

  private toOrm(task: Task): TaskOrmEntity {
    const orm = new TaskOrmEntity();
    orm.title = task.title;
    orm.description = task.description ?? '';
    orm.status = TaskStatusOrm[task.status];
    orm.createdAt = task.createdAt;
    return orm;
  }

  private toDomain(orm: TaskOrmEntity): Task {
    return Task.rehydrate(
      orm.id,
      orm.title,
      orm.description,
      TaskStatus[orm.status],
      orm.createdAt
    );
  }
}