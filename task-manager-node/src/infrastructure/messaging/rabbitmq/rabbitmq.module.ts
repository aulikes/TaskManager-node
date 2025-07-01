import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQPublisherService } from './rabbitmq-publisher.service';
import { AppLogger } from '../../../logger/app.logger';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQPublisherService, AppLogger],
  exports: [RabbitMQPublisherService],
})
export class RabbitMQModule {}
