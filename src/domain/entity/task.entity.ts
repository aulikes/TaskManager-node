import { TaskStatus } from '../enum/task-status.enum';

export class Task {
  constructor(
    public readonly id: string,
    public title: string,
    public description: string | null,
    public status: TaskStatus,
    public readonly createdAt: Date,
  ) {}

  complete(): void {
    if (this.status === TaskStatus.CANCELLED) {
      throw new Error('Cannot complete a cancelled task');
    }
    this.status = TaskStatus.COMPLETED;
  }

  cancel(): void {
    if (this.status === TaskStatus.COMPLETED) {
      throw new Error('Cannot cancel a completed task');
    }
    this.status = TaskStatus.CANCELLED;
  }

  start(): void {
    if (this.status !== TaskStatus.PENDING) {
      throw new Error('Task can only be started from pending state');
    }
    this.status = TaskStatus.IN_PROGRESS;
  }
}
