import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeorm.config';
import { TaskModule } from './modules/task/task.module';
import { HealthModule } from './health/health.module';
import { MetricsModule } from './metrics/metrics.module';
import { AppLogger } from './logger/app.logger';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,          // Hace que esté disponible en toda la app
      envFilePath: '.env',     // Ruta del archivo de propiedades
    }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    TaskModule,
    HealthModule,
    MetricsModule,
  ],
  providers: [AppLogger],
  exports: [AppLogger],
})
export class AppModule {}
