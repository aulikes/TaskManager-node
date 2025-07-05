import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppLogger } from '../../logger/app.logger';
import { TaskUpdatedEventDto } from '../dto/task-updated-event.dto';
import { TaskUpdatedEvent, TaskUpdatedEventDocument } from '../schema/task-updated-event.schema';
import { BadRequestException } from '@nestjs/common';

// Funciones de class-validator y class-transformer
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TaskUpdatedService {
  constructor(
    @InjectModel(TaskUpdatedEvent.name)
    private readonly model: Model<TaskUpdatedEventDocument>,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Guarda un evento de actualización de tarea en MongoDB.
   * Aplica validación por ID para evitar duplicados.
   */
  async saveEvent(payload : any): Promise<void> {
      const event = await this.getTaskCreatedEvent(payload);
      const doc = new this.model(event);
      await doc.save();
      this.logger.log(`TaskUpdatedEvent persisted (id: ${event.after.id})`, 'TaskUpdatedService');
  }

  private async getTaskCreatedEvent(payload : any) : Promise<TaskUpdatedEvent> {
    // Convertir el objeto plano recibido a una instancia del DTO
    const dto = plainToInstance(TaskUpdatedEventDto, payload);
    // Validar el DTO según las reglas declaradas en TaskCreatedEventDto
    const errors = await validate(dto);

    if (errors.length > 0) {
      this.logger.error('Validation failed for TaskUpdatedEvent', JSON.stringify(errors));
      throw new BadRequestException('Invalid task status');
    }

    // Si pasa la validación, registrar logs estructurados
    this.logger.log('DTO validated successfully');
    this.logger.debug('Validated DTO: ' + JSON.stringify(dto));

    
    const taskEvent: TaskUpdatedEvent = {
      before: dto.before,
      after: dto.after,
    };
    return taskEvent;
  }
}
