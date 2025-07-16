import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from './logger/app.logger';
import { declareRabbitBindings } from './config/declare-bindings';
import { HealthService } from './health/health.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  logger.log('TaskLogger-node is starting...', 'Bootstrap');

  // RABBITMQ CONFIGURATION
  // Declarar exchange, colas y bindings en RabbitMQ
  await declareRabbitBindings(config);
  // Configurar el microservicio RabbitMQ
  await app.startAllMicroservices();
  logger.log('RabbitMQ listener started', 'Bootstrap');


  // Validar disponibilidad de servicios externos antes de levantar el servidor
  try {
    logger.log('Verificando servicios externos...', 'HealthCheck');
    await app.get(HealthService).check();
    logger.log('Todos los servicios están disponibles', 'HealthCheck');
  } catch (error) {
    logger.error('Error en verificación de servicios críticos', error);
    process.exit(1);
  }

  //PORT CONFIGURATION
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`TaskLogger-node is running on port ${port}`);
}
bootstrap();
