import { retryFlexible } from '../../src/util/retry-flexible-util';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

describe('retryFlexible', () => {
  let configService: ConfigService;

  beforeEach(() => {
    // Se simula una instancia del ConfigService para devolver valores de configuración controlados.
    // Esto permite probar distintos escenarios sin depender de archivos .env reales.
    configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const configMap: Record<string, string> = {
          MAX_RETRIES: '3',         // Número de reintentos máximos configurados
          RETRY_DELAY_MS: '10',     // Tiempo de espera entre intentos en milisegundos
        };
        return configMap[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    // Se espían los métodos del Logger de NestJS para verificar si se loguean advertencias o errores.
    // No se espera que impriman nada en consola durante la prueba, por eso se mockean.
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks(); // Limpia los contadores de llamadas después de cada test
  });

  it('should succeed on first attempt', async () => {
    // Este test valida que si la función tiene éxito desde el primer intento,
    // no se realizan reintentos ni se escriben advertencias o errores en el log.

    const fn = jest.fn().mockResolvedValue('OK'); // Se simula una operación exitosa

    const result = await retryFlexible(fn, configService, 'TEST_OP');

    expect(result).toBe('OK'); // Se espera que devuelva el valor esperado
    expect(fn).toHaveBeenCalledTimes(1); // Solo se debe haber llamado una vez
    expect(Logger.prototype.warn).not.toHaveBeenCalled(); // No debe haber advertencias
    expect(Logger.prototype.error).not.toHaveBeenCalled(); // No debe haber errores
  });

  it('should retry on failure and eventually succeed', async () => {
    // Este test prueba que si la operación falla parcialmente,
    // la función reintenta y finalmente tiene éxito en un intento posterior.

    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('fail1'))  // Falla en el primer intento
      .mockRejectedValueOnce(new Error('fail2'))  // Falla en el segundo intento
      .mockResolvedValueOnce('SUCCESS');          // Tiene éxito en el tercer intento

    const result = await retryFlexible(fn, configService, 'RETRY_TEST');

    expect(result).toBe('SUCCESS'); // El valor final debe ser el exitoso
    expect(fn).toHaveBeenCalledTimes(3); // Debe haber 3 intentos en total
    expect(Logger.prototype.warn).toHaveBeenCalledTimes(2); // Dos advertencias por fallos previos
    expect(Logger.prototype.error).not.toHaveBeenCalled(); // No se debe haber registrado un error final
  });

  it('should throw error after all retries fail', async () => {
    // Este test verifica que si todos los intentos fallan,
    // se lanza una excepción final y se loguea un mensaje de error.

    const fn = jest.fn().mockRejectedValue(new Error('total failure')); // Siempre falla

    await expect(
      retryFlexible(fn, configService, 'FAIL_OP')
    ).rejects.toThrow('total failure'); // Se espera que lance el último error recibido

    expect(fn).toHaveBeenCalledTimes(3); // Tres intentos (1 inicial + 2 reintentos)
    expect(Logger.prototype.warn).toHaveBeenCalledTimes(3); // Tres advertencias (una por intento fallido)
    expect(Logger.prototype.error).toHaveBeenCalledWith(
      '[Retry][FAIL_OP] All 3 attempts failed.' // Se valida que se registre el error final correctamente
    );
  });
});
