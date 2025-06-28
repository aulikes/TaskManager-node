"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateTaskService = void 0;
const common_1 = require("@nestjs/common");
const task_entity_1 = require("../../domain/entity/task.entity");
const task_created_event_1 = require("../../domain/event/task-created.event");
const task_repository_1 = require("../../domain/repository/task.repository");
const task_created_event_publisher_1 = require("../port/out/task-created-event.publisher");
let CreateTaskService = class CreateTaskService {
    repository;
    eventPublisher;
    constructor(repository, eventPublisher) {
        this.repository = repository;
        this.eventPublisher = eventPublisher;
    }
    async execute(command) {
        const task = task_entity_1.Task.create(command.title, command.description);
        const saved = await this.repository.save(task);
        await this.eventPublisher.publish(new task_created_event_1.TaskCreatedEvent(saved.id, saved.title, saved.description, saved.status, saved.createdAt));
        return saved;
    }
};
exports.CreateTaskService = CreateTaskService;
exports.CreateTaskService = CreateTaskService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(task_repository_1.TaskRepositoryToken)),
    __param(1, (0, common_1.Inject)(task_created_event_publisher_1.TaskCreatedEventPublisherToken)),
    __metadata("design:paramtypes", [Object, Object])
], CreateTaskService);
//# sourceMappingURL=create-task.service.js.map