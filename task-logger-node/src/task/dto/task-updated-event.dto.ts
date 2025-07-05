import { IsNotEmpty, IsNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Representa el estado de una tarea (antes o después del cambio)
 */
export class TaskStateDto {
  @IsNumber()
  id: number;

  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  status: string;

  @IsNotEmpty()
  createdAt: Date;
}

/**
 * DTO que representa el evento de actualización de una tarea
 */
export class TaskUpdatedEventDto {
  @ValidateNested()
  @Type(() => TaskStateDto)
  before: TaskStateDto;

  @ValidateNested()
  @Type(() => TaskStateDto)
  after: TaskStateDto;
}
