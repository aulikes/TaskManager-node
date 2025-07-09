import { Injectable } from '@nestjs/common';
import { MongooseHealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import { AppLogger } from '../logger/app.logger';

@Injectable()
export class MongoHealthIndicator {
  constructor(
    private readonly mongooseIndicator: MongooseHealthIndicator,
    private readonly logger: AppLogger,
  ) {}

  /**
   * Verifica la conexión a MongoDB.
   */
  async isHealthy(): Promise<HealthIndicatorResult> {
    try {
      const result = await this.mongooseIndicator.pingCheck('mongodb');
      return result;
    } catch (err) {
      this.logger.error(`MongoDB health check failed: ${err.message}`);
      return {
          mongo: {
              status: 'down',
              message: err.message,
          },
      };
    }
  }
}
