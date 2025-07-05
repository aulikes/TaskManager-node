import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * Subdocumento para representar el estado de una tarea
 */
@Schema({ _id: false }) //evita que Mongo genere un campo _id innecesario en un subdocumento.
export class TaskState {
  @Prop({ required: true })
  id: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  createdAt: Date;
}

/**
 * Documento completo que representa un evento de actualización de tarea
 */
@Schema({ collection: 'task_updated_events', timestamps: true })
export class TaskUpdatedEvent {
  @Prop({ required: true, type: TaskState })
  before: TaskState;

  @Prop({ required: true, type: TaskState })
  after: TaskState;
}

export type TaskUpdatedEventDocument = TaskUpdatedEvent & Document;
export const TaskUpdatedEventSchema = SchemaFactory.createForClass(TaskUpdatedEvent);
