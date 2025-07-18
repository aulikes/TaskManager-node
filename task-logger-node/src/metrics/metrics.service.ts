import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  // Contadores base que se pueden extender
  public readonly tasksCreatedCounter = new Counter({
    name: 'tasks_created_total',
    help: 'Total number of tasks created',
    registers: [this.registry],
  });

  public readonly tasksUpdatedCounter = new Counter({
    name: 'tasks_updated_total',
    help: 'Total number of tasks updated',
    registers: [this.registry],
  });

  public readonly tasksDeletedCounter = new Counter({
    name: 'tasks_deleted_total',
    help: 'Total number of tasks deleted',
    registers: [this.registry],
  });

  public readonly failedMessagesCounter = new Counter({
    name: 'dlq_failed_messages_total',
    help: 'Total number of messages received in DLQ',
    registers: [this.registry],
  });

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
