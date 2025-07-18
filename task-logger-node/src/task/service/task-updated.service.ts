import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { AppLogger } from '../../logger/app.logger';
import { TaskUpdatedEventDto } from '../dto/task-updated-event.dto';
import { TaskUpdatedEvent, TaskUpdatedEventDocument } from '../schema/task-updated-event.schema';
import { BadRequestException } from '@nestjs/common';
import { NAME_CONNECTION_LOGGER_EVENTS } from '../../config/database.constants';
import { RetryPersist } from '../../util/retry-persist.util';
import { MetricsService } from '../../metrics/metrics.service';
// Funciones de class-validator y class-transformer
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class TaskUpdatedService {
  private readonly retryPersist: RetryPersist;

  constructor(
    @InjectModel(TaskUpdatedEvent.name, NAME_CONNECTION_LOGGER_EVENTS)
    private readonly model: Model<TaskUpdatedEventDocument>,
    private readonly logger: AppLogger,
    private readonly configService: ConfigService,
    private readonly metricsService: MetricsService, // para métricas
  ) {
    this.retryPersist = new RetryPersist(this.configService, this.logger);
  }

  /**
   * Guarda un evento de actualización de tarea en MongoDB.
   * Aplica validación por ID para evitar duplicados.
   */
  async saveEvent(payload : any): Promise<void> {
    const event = await this.getTaskCreatedEvent(payload);

    await this.retryPersist.execute(async () => {
      const doc = new this.model(event);
      await doc.save();
      // Aumentamos el contador de tareas actualizadas
      this.metricsService.tasksUpdatedCounter.inc();
      this.logger.log(`TaskUpdatedEvent persisted (id: ${event.after.id})`, 'TaskUpdatedService');
    });
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

    // crea el evento de tarea actualizada
    const taskEvent: TaskUpdatedEvent = {
      before: dto.before,
      after: dto.after,
    };
    return taskEvent;
  }
}
