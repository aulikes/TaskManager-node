import { Injectable, OnModuleInit } from '@nestjs/common';
import { Registry, collectDefaultMetrics, Counter } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  private readonly registry = new Registry();

  // Contadores base que se pueden extender
  public readonly tasksCreatedCounter = new Counter({
    name: 'tasks_created_success_total',
    help: 'Total number of tasks created',
    registers: [this.registry],
  });

  public readonly tasksCreatedDuplicatedCounter = new Counter({
    name: 'tasks_created_duplicated_total',
    help: 'Total number of tasks created with duplicated title',
    registers: [this.registry],
  });

  public readonly tasksCreatedErrorCounter = new Counter({
    name: 'tasks_created_error_total',
    help: 'Total number of tasks created with error',
    registers: [this.registry],
  });

  public readonly tasksUpdatedCounter = new Counter({
    name: 'tasks_updated_total',
    help: 'Total number of tasks updated',
    registers: [this.registry],
  });

  public readonly tasksUpdatedErrorCounter = new Counter({
    name: 'tasks_updated_error_total',
    help: 'Total number of tasks updated with error',
    registers: [this.registry],
  });

  public readonly tasksDeletedCounter = new Counter({
    name: 'tasks_deleted_total',
    help: 'Total number of tasks deleted',
    registers: [this.registry],
  });

  public readonly tasksDeletedErrorCounter = new Counter({
    name: 'tasks_deleted_error_total',
    help: 'Total number of tasks deleted with error',
    registers: [this.registry],
  });

  public readonly tasksNotFoundCounter = new Counter({
    name: 'tasks_created_nofound_total',
    help: 'Total number of tasks not found',
    registers: [this.registry],
  });


  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
