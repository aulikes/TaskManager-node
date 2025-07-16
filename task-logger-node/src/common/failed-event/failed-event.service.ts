import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FailedEvent, FailedEventDocument } from './failed-event.schema';

@Injectable()
export class FailedTaskEventService {
  constructor(
    @InjectModel(FailedEvent.name, 'connection-mongobd-failed-events')
    private readonly failedModel: Model<FailedEventDocument>,
  ) {}

  async saveEvent(event: FailedEvent): Promise<void> {
    await this.failedModel.create(event);
  }
}
