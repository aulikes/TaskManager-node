import { TaskCreatedEvent } from '../../../domain/event/task-created.event';
export declare const TaskCreatedEventPublisherToken: unique symbol;
export interface TaskCreatedEventPublisher {
    publish(event: TaskCreatedEvent): Promise<void>;
}
