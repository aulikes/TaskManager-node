import { TaskStatus } from '../enum/task-status.enum';
export declare class Task {
    readonly id: number | undefined;
    title: string;
    description: string;
    status: TaskStatus;
    readonly createdAt: Date;
    private constructor();
    static create(title: string, description: string): Task;
    static rehydrate(id: number, title: string, description: string, status: TaskStatus, createdAt: Date): Task;
    start(): void;
    complete(): void;
    cancel(): void;
}
