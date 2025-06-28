"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskModule = void 0;
const common_1 = require("@nestjs/common");
const task_controller_1 = require("../controller/task.controller");
const create_task_service_1 = require("../../../application/use-case/create-task.service");
const create_task_use_case_1 = require("../../../application/port/in/create-task.use-case");
const task_repository_1 = require("../../../domain/repository/task.repository");
const task_repository_impl_1 = require("../../../infrastructure/persistence/repository/task.repository.impl");
const task_created_event_publisher_1 = require("../../../application/port/out/task-created-event.publisher");
const rabbit_task_created_event_publisher_1 = require("../../messaging/rabbit-task-created-event.publisher");
const typeorm_1 = require("@nestjs/typeorm");
const task_orm_entity_1 = require("../../../infrastructure/persistence/model/task.orm-entity");
let TaskModule = class TaskModule {
};
exports.TaskModule = TaskModule;
exports.TaskModule = TaskModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([task_orm_entity_1.TaskOrmEntity]),
        ],
        controllers: [task_controller_1.TaskController],
        providers: [
            {
                provide: create_task_use_case_1.CreateTaskUseCaseToken,
                useClass: create_task_service_1.CreateTaskService,
            },
            {
                provide: task_repository_1.TaskRepositoryToken,
                useClass: task_repository_impl_1.PostgresTaskRepository,
            },
            {
                provide: task_created_event_publisher_1.TaskCreatedEventPublisherToken,
                useClass: rabbit_task_created_event_publisher_1.RabbitTaskCreatedEventPublisher,
            },
        ],
    })
], TaskModule);
//# sourceMappingURL=task.module.js.map