import { Injectable } from '@nestjs/common';
import { MongooseHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { AppLogger } from '../logger/app.logger';

@Injectable()
export class MongoHealthIndicator {
  constructor(
    private readonly mongooseIndicator: MongooseHealthIndicator,
    private readonly logger: AppLogger,
  ) {}

  // /**
  //  * Verifica la conexión con la base de datos principal (task-events)
  //  */
  // async isTaskEventsDbHealthy(): Promise<HealthIndicatorResult> {
  //   try {
  //     const result = await this.mongooseIndicator.pingCheck('task-events', {
  //       connection: 'task-events',
  //     });
  //     return result;
  //   } catch (err) {
  //     this.logger.error(`MongoDB 'task-events' health check failed: ${err.message}`);
  //     return {
  //       'mongo-task-events': {
  //         status: 'down',
  //         message: err.message,
  //       },
  //     };
  //   }
  // }

  // /**
  //  * Verifica la conexión con la base de datos secundaria (failed-events)
  //  */
  // async isFailedEventsDbHealthy(): Promise<HealthIndicatorResult> {
  //   try {
  //     const result = await this.mongooseIndicator.pingCheck('failed-events', {
  //       connection: 'failed-events',
  //     });
  //     return result;
  //   } catch (err) {
  //     this.logger.error(`MongoDB 'failed-events' health check failed: ${err.message}`);
  //     return {
  //       'mongo-failed-events': {
  //         status: 'down',
  //         message: err.message,
  //       },
  //     };
  //   }
  // }
}
