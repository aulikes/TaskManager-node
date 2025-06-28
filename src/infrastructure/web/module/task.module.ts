import { Module } from '@nestjs/common';
import { TaskController } from '../controller/task.controller';
import { CreateTaskService } from '../../../application/use-case/create-task.service';
import { CreateTaskUseCaseToken } from '../../../application/port/in/create-task.use-case';
import { TaskRepositoryToken } from '../../../domain/repository/task.repository';
import { PostgresTaskRepository } from '../../../infrastructure/persistence/repository/task.repository.impl';
import { TaskCreatedEventPublisherToken } from '../../../application/port/out/task-created-event.publisher';
import { RabbitTaskCreatedEventPublisher } from '../../messaging/rabbit-task-created-event.publisher';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskOrmEntity } from '../../../infrastructure/persistence/model/task.orm-entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([TaskOrmEntity]),
  ],
  controllers: [TaskController],
  providers: [
    {
      provide: CreateTaskUseCaseToken,
      useClass: CreateTaskService,
    },
    {
      provide: TaskRepositoryToken,
      useClass: PostgresTaskRepository,
    },
    {
      provide: TaskCreatedEventPublisherToken,
      useClass: RabbitTaskCreatedEventPublisher,
    },
  ],
})
export class TaskModule {}
