import { ConfigService } from '@nestjs/config';
import { AppLogger } from '../logger/app.logger';
import { TimeoutError } from '../error/timeout.error';

/**
 * Ejecuta una función con reintentos y timeout configurable por intento.
 *
 * @param fn Función que se desea ejecutar
 * @param config ConfigService para obtener la configuración
 * @param logger Instancia de AppLogger para logs estructurados
 * @param label Contexto de logs generado con `getClassMethodContextLabel`
 */
export async function retryWithTimeout<T>(
  fn: () => T | Promise<T>,
  config: ConfigService,
  logger: AppLogger,
  label : String
): Promise<T> {
  const maxAttempts = config.getOrThrow('RETRY_ATTEMPTS');    // máximo de intentos
  const delayMs = config.getOrThrow('RETRY_DELAY_MS');        // tiempo de espera entre intentos
  const timeoutMs = config.getOrThrow('RETRY_TIMEOUT_MS');    // tiempo máximo para cada intento
  
  let lastError: any;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await runWithTimeout(fn, timeoutMs);
      return result;
    } catch (err) {
      lastError = err;
      const reason = err.name === 'TimeoutError' ? 'timeout' : err.message;
      logger.warn(`[Retry][${label}] Attempt ${attempt} failed: ${reason}`);

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  logger.error(`[Retry][${label}] All ${maxAttempts} attempts failed.`);
  throw lastError;
}

/**
 * Ejecuta una función con timeout usando AbortController.
 * Si la función no termina en el tiempo definido, lanza un TimeoutError.
 */
async function runWithTimeout<T>(fn: () => T | Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const controller = new AbortController();
    const id = setTimeout(() => {
      controller.abort();
      reject(new TimeoutError(`Function timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    Promise.resolve()
      .then(fn)
      .then((res) => {
        clearTimeout(id);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(id);
        reject(err);
      });
  });
}

