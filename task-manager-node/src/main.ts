import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppLogger } from './logger/app.logger';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { declareRabbitBindings } from './config/declare-bindings';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const logger = app.get(AppLogger);

  logger.log('TaskManager-node is starting...', 'Bootstrap');

  //OPENAPI CONFIGURATION
  const openApi = new DocumentBuilder()
    .setTitle('Task Manager API')
    .setDescription('API for managing tasks')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, openApi);
  SwaggerModule.setup('api', app, document);

  await declareRabbitBindings(config);

  //PORT CONFIGURATION
  const port = config.getOrThrow<number>('PORT');
  await app.listen(port);
  logger.log(`TaskManager-node is running on port ${port}`);
}
bootstrap();
