"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typeOrmConfig = void 0;
const config_1 = require("@nestjs/config");
const task_orm_entity_1 = require("../infrastructure/persistence/model/task.orm-entity");
exports.typeOrmConfig = {
    imports: [config_1.ConfigModule],
    inject: [config_1.ConfigService],
    useFactory: (config) => {
        console.log('POSTGRES_PORT:', config.get('POSTGRES_PORT'));
        return {
            type: 'postgres',
            host: config.get('POSTGRES_HOST', 'localhost'),
            port: parseInt(config.getOrThrow('POSTGRES_PORT'), 10),
            username: config.getOrThrow('POSTGRES_USER'),
            password: config.getOrThrow('POSTGRES_PASSWORD'),
            database: config.getOrThrow('POSTGRES_DB'),
            entities: [task_orm_entity_1.TaskOrmEntity],
            synchronize: true,
        };
    },
};
//# sourceMappingURL=typeorm.config.js.map