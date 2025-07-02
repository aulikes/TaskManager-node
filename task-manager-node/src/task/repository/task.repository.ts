import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskEntity } from '../model/task.entity';

@Injectable()
export class PostgresTaskRepository {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly ormRepo: Repository<TaskEntity>
  ) {}

  /**
   * Guarda una entidad Task en la base de datos.
   * Retorna la entidad ya persistida, con el ID generado por el motor de BD.
   */
  async save(task: TaskEntity): Promise<TaskEntity> {
    const persisted = await this.ormRepo.save(task);
    return persisted;
  }

  /**
   * Busca una tarea por su ID. Devuelve una entidad de dominio si se encuentra, o null si no.
   */
  async findById(id: number): Promise<TaskEntity | null> {
    const orm = await this.ormRepo.findOne({ where: { id } });
    return orm;
  }

  /**
   * Obtiene todas las tareas guardadas en la base de datos.
   */
  async findAll(): Promise<TaskEntity[]> {
    const ormList = await this.ormRepo.find();
    return ormList;
  }

  /**
   * Elimina una tarea de la base de datos por ID.
   */
  async delete(id: string): Promise<void> {
    await this.ormRepo.delete(id);
  }
}