import { TaskCreatedEvent } from '../../../domain/event/task-created.event';

export const TaskCreatedEventPublisherToken = Symbol('TaskCreatedEventPublisher');

export interface TaskCreatedEventPublisher {
  publish(event: TaskCreatedEvent): Promise<void>;
}
