import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new task via REST API
 */
export class CreateTaskDto {
  @ApiProperty({ description: 'Title of the task' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ description: 'Optional task description' })
  @IsString()
  description: string;
}
