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
exports.TaskController = void 0;
const common_1 = require("@nestjs/common");
const common_2 = require("@nestjs/common");
const create_task_use_case_1 = require("../../../application/port/in/create-task.use-case");
const create_task_dto_1 = require("../dto/create-task.dto");
const create_task_command_1 = require("../../../application/command/create-task.command");
let TaskController = class TaskController {
    createTaskUseCase;
    constructor(createTaskUseCase) {
        this.createTaskUseCase = createTaskUseCase;
    }
    async create(dto) {
        const command = new create_task_command_1.CreateTaskCommand(dto.title, dto.description);
        return await this.createTaskUseCase.execute(command);
    }
};
exports.TaskController = TaskController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_task_dto_1.CreateTaskDto]),
    __metadata("design:returntype", Promise)
], TaskController.prototype, "create", null);
exports.TaskController = TaskController = __decorate([
    (0, common_1.Controller)('tasks'),
    __param(0, (0, common_2.Inject)(create_task_use_case_1.CreateTaskUseCaseToken)),
    __metadata("design:paramtypes", [Object])
], TaskController);
//# sourceMappingURL=task.controller.js.map