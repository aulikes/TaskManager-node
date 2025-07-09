import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'failed_events', timestamps: true })
export class FailedEvent {
  @Prop({ required: true })
  exchange: string;

  @Prop({ required: true })
  routingKey: string;

  @Prop({ required: true, type: Object })
  payload: any;

  @Prop({ required: true })
  reason: string;
}

export type FailedEventDocument = FailedEvent & Document;
export const FailedEventSchema = SchemaFactory.createForClass(FailedEvent);
