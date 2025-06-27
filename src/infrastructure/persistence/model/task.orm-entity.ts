import { Column, Entity, PrimaryColumn } from 'typeorm';
import { TaskStatusOrm } from './task-status.orm';

@Entity({ name: 'tasks' })
export class TaskOrmEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'enum', enum: TaskStatusOrm })
  status: TaskStatusOrm;

  @Column({ type: 'timestamp' })
  createdAt: Date;
}
