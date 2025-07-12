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

  // Registrar el filtro global de excepciones
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Declarar los exchanges y colas
  try {
    await declareRabbitBindings(config);
    logger.log('RabbitMQ bindings successfully declared');
  } catch (err) {
    logger.error(
      `Failed to declare RabbitMQ bindings: ${(err as Error).message}`,
      (err as Error).stack,
    );
    process.exit(1); // Abortamos si Rabbit no está disponible
  }

  //OPENAPI CONFIGURATION
  const openApi = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('API for managing tasks')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup('api', app, document);

  // Validar dependencias antes de iniciar
  try {
    logger.log('Verificando disponibilidad de servicios externos...');
    await app.get(HealthService).check(); // Si falla, lanza excepción
    logger.log('Todos los servicios externos están disponibles.');
  } catch (error) {
    logger.error('Error en validación de dependencias críticas:', error);
    process.exit(1); // Termina la app si algo está caído
  }

  //PORT CONFIGURATION
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`TaskManager-node is running on port ${port}`);
}
bootstrap();
