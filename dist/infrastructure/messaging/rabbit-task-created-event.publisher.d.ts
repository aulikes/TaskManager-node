import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TaskCreatedEventPublisher } from '../../application/port/out/task-created-event.publisher';
import { TaskCreatedEvent } from '../../domain/event/task-created.event';
export declare class RabbitTaskCreatedEventPublisher implements TaskCreatedEventPublisher, OnModuleInit {
    private readonly config;
    private readonly logger;
    private channel;
    private connection;
    constructor(config: ConfigService);
    onModuleInit(): Promise<void>;
    publish(event: TaskCreatedEvent): Promise<void>;
}
