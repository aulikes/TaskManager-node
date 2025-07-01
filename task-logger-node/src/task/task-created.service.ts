import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppLogger } from '../logger/app.logger';
import { TaskCreatedEvent, TaskCreatedEventDocument } from './task-created-event.schema';

@Injectable()
export class TaskCreatedService {
  constructor(
    @InjectModel(TaskCreatedEvent.name)
    private readonly eventModel: Model<TaskCreatedEventDocument>,
    private readonly logger: AppLogger,
  ) {}

  async saveEvent(data: TaskCreatedEvent): Promise<void> {
    const created = new this.eventModel(data);
    await created.save();
  }
}
