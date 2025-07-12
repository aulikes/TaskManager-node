import { Body, Controller, Post, Put, Delete, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { CreateTaskService } from '../service/create-task.service';
import { UpdateTaskService } from '../service/update-task.service';
import { DeleteTaskService } from '../service/delete-task.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskEntity } from '../model/task.entity';

@Controller('tasks')
export class TaskController {

  constructor(
    private readonly createTaskService: CreateTaskService,
    private readonly updateTaskService: UpdateTaskService,
    private readonly deleteTaskService: DeleteTaskService,
  ) {}

  @Post()
  async create(@Body() dto: CreateTaskDto): Promise<TaskEntity> {
    return await this.createTaskService.execute(dto);
  }

  @Put(':id')
  async updateTask(@Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.updateTaskService.execute(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(@Param('id') id: number): Promise<void> {
    await this.deleteTaskService.execute(id);
  }
}