import { TaskStatusOrm } from './task-status.orm';
export declare class TaskOrmEntity {
    id: number;
    title: string;
    description: string;
    status: TaskStatusOrm;
    createdAt: Date;
}
