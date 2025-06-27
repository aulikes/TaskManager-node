import { Module } from '@nestjs/common';
import { TaskController } from '../rest/task.controller';
import { CreateTaskService } from '../../../application/use-case/create-task.service';
import { CreateTaskUseCaseToken } from '../../../application/port/in/create-task.use-case';
import { TaskRepositoryToken } from '../../../domain/repository/task.repository';
import { PostgresTaskRepository } from '../../../infrastructure/persistence/repository/task.repository.impl';


@Module({
  controllers: [TaskController],
  providers: [
    {
      provide: CreateTaskUseCaseToken,
      useClass: CreateTaskService,
    },
    {
      provide: TaskRepositoryToken,
      useClass: PostgresTaskRepository, // temporal, hasta que implementes persistencia real
    },
  ],
})
export class TaskModule {}
