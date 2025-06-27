import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskOrmEntity } from '../infrastructure/persistence/model/task.orm-entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: 'postgres',
    host: config.get('POSTGRES_HOST', ''),
    port: parseInt(config.get('POSTGRES_PORT', ''), 10),
    username: config.get('POSTGRES_USER', ''),
    password: config.get('POSTGRES_PASSWORD', ''),
    database: config.get('POSTGRES_DB', ''),
    entities: [TaskOrmEntity],
    synchronize: true,
  }),
};
