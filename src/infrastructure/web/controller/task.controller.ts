import { Body, Controller, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { CreateTaskUseCaseToken, CreateTaskUseCase } from '../../../application/port/in/create-task.use-case';
import { CreateTaskDto } from '../dto/create-task.dto';
import { CreateTaskCommand } from '../../../application/command/create-task.command';
import { Task } from '../../../domain/entity/task.entity';

@Controller('tasks')
export class TaskController {

  constructor(
    @Inject(CreateTaskUseCaseToken)
    private readonly createTaskUseCase: CreateTaskUseCase
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<Task> {
    const command = new CreateTaskCommand(dto.title, dto.description);
    return await this.createTaskUseCase.execute(command);
  }
}

