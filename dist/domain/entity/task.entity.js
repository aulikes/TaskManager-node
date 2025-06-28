"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = void 0;
const task_status_enum_1 = require("../enum/task-status.enum");
class Task {
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
    static create(title, description) {
        return new Task(undefined, title, description, task_status_enum_1.TaskStatus.PENDING, new Date());
    }
    static rehydrate(id, title, description, status, createdAt) {
        return new Task(id, title, description, status, createdAt);
    }
    start() {
        if (this.status !== task_status_enum_1.TaskStatus.PENDING) {
            throw new Error('Task can only be started from pending state');
        }
        this.status = task_status_enum_1.TaskStatus.IN_PROGRESS;
    }
    complete() {
        if (this.status === task_status_enum_1.TaskStatus.CANCELLED) {
            throw new Error('Cannot complete a cancelled task');
        }
        this.status = task_status_enum_1.TaskStatus.COMPLETED;
    }
    cancel() {
        if (this.status === task_status_enum_1.TaskStatus.COMPLETED) {
            throw new Error('Cannot cancel a completed task');
        }
        this.status = task_status_enum_1.TaskStatus.CANCELLED;
    }
}
exports.Task = Task;
//# sourceMappingURL=task.entity.js.map