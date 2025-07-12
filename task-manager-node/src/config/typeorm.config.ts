import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TaskEntity } from '../modules/task/model/task.entity';

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => {
    // Log temporal para verificar que las variables se leen correctamente
    console.log('POSTGRES_PORT:', config.get('POSTGRES_PORT'));

    return {
      type: 'postgres',
      host: config.get<string>('POSTGRES_HOST', 'localhost'),
      port: parseInt(config.getOrThrow('POSTGRES_PORT'), 10),
      username: config.getOrThrow('POSTGRES_USER'),
      password: config.getOrThrow('POSTGRES_PASSWORD'),
      database: config.getOrThrow('POSTGRES_DB'),
      entities: [TaskEntity],
      synchronize: true, // Habilitar solo en desarrollo
    };
  },
};
