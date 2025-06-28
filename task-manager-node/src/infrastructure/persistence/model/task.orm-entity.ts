import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TaskStatusOrm } from './task-status.orm';

/**
 * Representación ORM de la entidad Task con ID secuencial autogenerado.
 */
@Entity({ name: 'task' })
export class TaskOrmEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatusOrm })
  status: TaskStatusOrm;

  @Column({ type: 'timestamp' })
  createdAt: Date;
}
