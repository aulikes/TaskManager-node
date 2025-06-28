"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskCreatedEvent = void 0;
class TaskCreatedEvent {
    id;
    title;
    description;
    status;
    createdAt;
    constructor(id, title, description, status, createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }
}
exports.TaskCreatedEvent = TaskCreatedEvent;
//# sourceMappingURL=task-created.event.js.map