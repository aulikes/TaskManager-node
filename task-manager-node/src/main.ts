import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import { ConfigService } from '@nestjs/config';
import { declareRabbitBindings } from './config/declare-bindings';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter'; // importar el filtro
import { HealthService } from './health/health.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  logger.log('TaskManager-node is starting...', 'Bootstrap');

  // Validación global de DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,               // Elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true,    // Lanza error si se envían campos no permitidos
      transform: true,               // Convierte automáticamente tipos (ej: string a number)
    }),
  );
  
  // Filtro global para manejo uniforme de errores o excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Declarar exchanges y colas de RabbitMQ
  try {
    await declareRabbitBindings(config);
    logger.log('RabbitMQ bindings successfully declared', 'Bootstrap');
  } catch (err) {
    logger.error(
      'Failed to declare RabbitMQ bindings',
      (err as Error).stack,
    );
    process.exit(1); // Termina la app si falla la declaración de bindings
  }

  // Validar disponibilidad de servicios externos antes de levantar el servidor
  try {
    logger.log('Verificando servicios externos...', 'HealthCheck');
    await app.get(HealthService).check();
    logger.log('Todos los servicios están disponibles', 'HealthCheck');
  } catch (error) {
    logger.error('Error en verificación de servicios críticos', error);
    process.exit(1);
  }

  //OPENAPI CONFIGURATION
  const openApi = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('API for managing tasks')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup('api', app, document);

  //PORT CONFIGURATION
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`TaskManager-node is running on port ${port}`, 'Bootstrap');
}
bootstrap();
