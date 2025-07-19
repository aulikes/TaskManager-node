import { ConfigService } from '@nestjs/config';
import { RetryPersist } from '../../src/util/retry-persist.util';
import { AppLogger } from '../../src/logger/app.logger';

describe('RetryPersist', () => {
  let retryPersist: RetryPersist;
  let mockLogger: AppLogger;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    // Se simula ConfigService devolviendo valores fijos para reintentos y retardo.
    // Esto evita depender de variables de entorno reales durante la prueba.
    mockConfigService = {
      getOrThrow: jest.fn((key: string) => {
        const configMap: Record<string, string> = {
          RETRY_MAX_ATTEMPTS: '2', // número máximo de reintentos
          RETRY_DELAY_MS: '10',    // tiempo de espera entre reintentos (en ms)
        };
        return configMap[key];
      }),
    } as unknown as ConfigService;

    // Se crea un mock del logger de aplicación que captura llamadas a `warn` y `error`,
    // permitiendo verificar si los mensajes se loguean correctamente.
    mockLogger = {
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLogger;

    // Se instancia la clase bajo prueba utilizando los mocks anteriores.
    retryPersist = new RetryPersist(mockConfigService, mockLogger);
  });

  it('should return result on first try if operation succeeds', async () => {
    // Este test verifica que, si la operación es exitosa desde el inicio,
    // no se realiza ningún reintento y el resultado se devuelve directamente.
    const operation = jest.fn().mockResolvedValue('OK');

    const result = await retryPersist.execute(operation);

    expect(result).toBe('OK');
    expect(operation).toHaveBeenCalledTimes(1); // Solo un intento fue necesario
  });

  it('should retry on failure and eventually succeed', async () => {
    // Este caso prueba que si la operación falla inicialmente pero tiene éxito en un reintento,
    // el sistema la reintenta correctamente y retorna el resultado exitoso.
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail 1'))  // Primer intento falla
      .mockResolvedValueOnce('SUCCESS');           // Segundo intento tiene éxito

    const result = await retryPersist.execute(operation);

    expect(result).toBe('SUCCESS');
    expect(operation).toHaveBeenCalledTimes(2); // Se hizo 1 reintento
    expect(mockLogger.warn).toHaveBeenCalledWith(
      expect.stringContaining('Intento 1/2 fallido'), // Mensaje de advertencia esperado
    );
  });

  it('should throw error after exceeding max retries', async () => {
    // Este test garantiza que, si todos los intentos fallan,
    // la clase lanza una excepción y se registra un mensaje de error.
    const operation = jest.fn().mockRejectedValue(new Error('persistent error'));

    await expect(retryPersist.execute(operation)).rejects.toThrow('persistent error');

    expect(operation).toHaveBeenCalledTimes(3); // Intentos: 0 (fallo), 1 (fallo), 2 (fallo) → error final
    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.stringContaining('Fallaron los 2 intentos'), // Mensaje esperado al agotar reintentos
      expect.anything()                                   // Detalles del error
    );
  });
});
