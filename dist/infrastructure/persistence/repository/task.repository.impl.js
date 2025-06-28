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
exports.PostgresTaskRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("../../../domain/entity/task.entity");
const task_status_enum_1 = require("../../../domain/enum/task-status.enum");
const task_orm_entity_1 = require("../model/task.orm-entity");
const task_status_orm_1 = require("../model/task-status.orm");
let PostgresTaskRepository = class PostgresTaskRepository {
    ormRepo;
    constructor(ormRepo) {
        this.ormRepo = ormRepo;
    }
    async save(task) {
        const ormEntity = this.toOrm(task);
        const persisted = await this.ormRepo.save(ormEntity);
        return this.toDomain(persisted);
    }
    async findById(id) {
        const orm = await this.ormRepo.findOne({ where: { id } });
        return orm ? this.toDomain(orm) : null;
    }
    async findAll() {
        const ormList = await this.ormRepo.find();
        return ormList.map(this.toDomain);
    }
    async delete(id) {
        await this.ormRepo.delete(id);
    }
    toOrm(task) {
        const orm = new task_orm_entity_1.TaskOrmEntity();
        orm.title = task.title;
        orm.description = task.description ?? '';
        orm.status = task_status_orm_1.TaskStatusOrm[task.status];
        orm.createdAt = task.createdAt;
        return orm;
    }
    toDomain(orm) {
        return task_entity_1.Task.rehydrate(orm.id, orm.title, orm.description, task_status_enum_1.TaskStatus[orm.status], orm.createdAt);
    }
};
exports.PostgresTaskRepository = PostgresTaskRepository;
exports.PostgresTaskRepository = PostgresTaskRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_orm_entity_1.TaskOrmEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PostgresTaskRepository);
//# sourceMappingURL=task.repository.impl.js.map