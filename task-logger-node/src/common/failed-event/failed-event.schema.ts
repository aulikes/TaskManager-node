// Esquema Mongoose para eventos fallidos
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'failed_events', timestamps: true })
export class FailedEvent {
    
  @Prop({ required: true })
  originalQueue: string;

  @Prop({ required: true })
  routingKey: string;

  @Prop({ required: true })
  payload: string;

  @Prop()
  error: string;
}

export type FailedEventDocument = FailedEvent & Document;
export const FailedEventSchema = SchemaFactory.createForClass(FailedEvent);
