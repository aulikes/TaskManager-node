import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/app.logger';

export class RetryPersist {
  private readonly maxRetries: number;
  private readonly delayMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger, // Logger basado en Winston
  ) {
    this.maxRetries = parseInt(this.configService.getOrThrow<string>('RETRY_MAX_ATTEMPTS'));
    this.delayMs = parseInt(this.configService.getOrThrow<string>('RETRY_DELAY_MS'));
  }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      try {
        return await operation();
      } catch (error) {
        attempt++;

        if (attempt > this.maxRetries) {
          this.logger.error(`Fallaron los ${this.maxRetries} intentos de persistencia`, error.stack);
          throw error;
        }

        this.logger.warn(`Intento ${attempt}/${this.maxRetries} fallido. Reintentando en ${this.delayMs}ms...`);
        await new Promise((res) => setTimeout(res, this.delayMs));
      }
    }

    throw new Error('Error inesperado en retryPersist');
  }
}
