import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TaskModule } from './infrastructure/web/module/task.module';
import { HealthModule } from './infrastructure/web/module/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          // Hace que esté disponible en toda la app
      envFilePath: '.env',     // Ruta del archivo de propiedades
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    TaskModule,
    HealthModule
  ],
})
export class AppModule {}
