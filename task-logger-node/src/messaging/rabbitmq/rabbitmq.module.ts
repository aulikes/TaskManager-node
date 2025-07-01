import { Module } from '@nestjs/common';
import { RabbitMqListenerService } from './rabbitmq-listener.service';
import { AppLogger } from '../../logger/app.logger';

@Module({
  providers: [RabbitMqListenerService, AppLogger],
  exports: [RabbitMqListenerService],
})
export class RabbitMqModule {}
