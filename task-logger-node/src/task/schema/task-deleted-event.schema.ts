import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'task_deleted_events', timestamps: true })
export class TaskDeletedEvent {
  @Prop({ required: true, unique: true })
  id: number;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] })
  status: string;
}

export type TaskDeletedEventDocument = TaskDeletedEvent & Document;
export const TaskDeletedEventSchema = SchemaFactory.createForClass(TaskDeletedEvent);
