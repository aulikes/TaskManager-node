import { Body, Controller, Post } from '@nestjs/common';
import { CreateTaskService } from '../service/create-task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskEntity } from '../model/task.entity';

@Controller('tasks')
export class TaskController {

  constructor(
    private readonly createTaskService: CreateTaskService
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<TaskEntity> {
    return await this.createTaskService.execute(dto);
  }
}