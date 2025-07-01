import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';
import { AppLogger } from '../../../logger/app.logger';

@Module({
  imports: [ConfigModule],
  providers: [RabbitMQService, AppLogger],
  exports: [RabbitMQService],
})
export class RabbitMQModule {}
