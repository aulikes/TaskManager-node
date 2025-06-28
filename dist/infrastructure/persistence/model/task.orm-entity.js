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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskOrmEntity = void 0;
const typeorm_1 = require("typeorm");
const task_status_orm_1 = require("./task-status.orm");
let TaskOrmEntity = class TaskOrmEntity {
    id;
    title;
    description;
    status;
    createdAt;
};
exports.TaskOrmEntity = TaskOrmEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], TaskOrmEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], TaskOrmEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], TaskOrmEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: task_status_orm_1.TaskStatusOrm }),
    __metadata("design:type", String)
], TaskOrmEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], TaskOrmEntity.prototype, "createdAt", void 0);
exports.TaskOrmEntity = TaskOrmEntity = __decorate([
    (0, typeorm_1.Entity)({ name: 'task' })
], TaskOrmEntity);
//# sourceMappingURL=task.orm-entity.js.map