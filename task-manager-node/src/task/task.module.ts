import { Module } from '@nestjs/common';
import { TaskController } from './controller/task.controller';
import { CreateTaskService } from './service/create-task.service';
import { UpdateTaskService } from './service/update-task.service';
import { DeleteTaskService } from './service/delete-task.service';
import { PostgresTaskRepository } from './repository/task.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from './model/task.entity';
import { AppLogger } from '../logger/app.logger';
import { RabbitMQModule } from '../messaging/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    RabbitMQModule, 
  ],
  controllers: [TaskController],
  providers: [
    AppLogger,
    CreateTaskService,
    UpdateTaskService,
    DeleteTaskService,
    PostgresTaskRepository,
  ],
})
export class TaskModule {}
