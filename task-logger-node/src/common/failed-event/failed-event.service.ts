import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppLogger } from '../../logger/app.logger';
import { FailedEvent, FailedEventDocument } from './failed-event.schema';
import { NAME_CONNECTION_FAILED_EVENTS } from '../../config/database.constants';

@Injectable()
export class FailedTaskEventService {
  constructor(
    @InjectModel(FailedEvent.name, NAME_CONNECTION_FAILED_EVENTS)
    private readonly model: Model<FailedEventDocument>,
    private readonly logger: AppLogger,
  ) {}

  async saveEvent(payload : any): Promise<void> {

    this.logger.log(`TaskFailedEvent persisted (id: ${payload.id})`, 'FailedTaskEventService');

    const doc = new this.model(payload);
    await doc.save();
    // this.logger.log(`TaskFailedEvent persisted (id: ${event.id})`, 'FailedTaskEventService');
  }
}
