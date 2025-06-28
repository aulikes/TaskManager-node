export declare class TaskCreatedEvent {
    readonly id: number;
    readonly title: string;
    readonly description: string;
    readonly status: string;
    readonly createdAt: Date;
    constructor(id: number, title: string, description: string, status: string, createdAt: Date);
}
