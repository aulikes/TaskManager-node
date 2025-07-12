export class TaskUpdatedEvent {
  constructor(
    public readonly before: TaskState,
    public readonly after: TaskState,
  ) {}
}

export class TaskState {
  constructor(
    public readonly id: number,
    public readonly title: string,
    public readonly description: string,
    public readonly status: string,
    public readonly createdAt: Date,
  ) {}
}