import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const logger = new Logger('RetryUtility');

export async function retryFlexible<T>(
  fn: () => T | Promise<T>,
  config: ConfigService,
  label = 'operation'
): Promise<T> {
  const maxAttempts = parseInt(config.get('MAX_RETRIES', '3'), 10);
  const delayMs = parseInt(config.get('RETRY_DELAY_MS', '500'), 10);
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await Promise.resolve(fn());
      return result;
    } catch (err) {
      lastError = err;
      logger.warn(`[Retry][${label}] Attempt ${attempt} failed: ${err.message}`);
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  logger.error(`[Retry][${label}] All ${maxAttempts} attempts failed.`);
  throw lastError;
}
