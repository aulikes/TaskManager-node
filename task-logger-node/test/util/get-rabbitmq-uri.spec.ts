import { ConfigService } from '@nestjs/config';
import { getRabbitMqUri } from '../../src/util/get-rabbitmq-uri';

describe('getRabbitMqUri', () => {
  let configService: ConfigService;

  beforeEach(() => {
    configService = new ConfigService();

    // Se simula el método getOrThrow de ConfigService para devolver variables de entorno mockeadas.
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      const configMap: Record<string, string | number> = {
        RABBITMQ_USER: 'guest',
        RABBITMQ_PASSWORD: 'guest',
        RABBITMQ_HOST: 'localhost',
        RABBITMQ_PORT: 5672,
      };
      return configMap[key];
    });
  });

  it('should return a valid RabbitMQ URI based on configuration values', () => {
    // Se ejecuta la función con la configuración simulada y se valida la URI generada.
    const uri = getRabbitMqUri(configService);
    expect(uri).toBe('amqp://guest:guest@localhost:5672');
  });

  it('should throw an error when a required configuration value is missing', () => {
    // Se simula que falta una variable obligatoria para provocar un error
    jest.spyOn(configService, 'getOrThrow').mockImplementation((key: string) => {
      if (key === 'RABBITMQ_PASSWORD') {
        throw new Error('Missing env');
      }
      return 'dummy';
    });

    // Se espera que la función lance una excepción al faltar un valor requerido
    expect(() => getRabbitMqUri(configService)).toThrowError('Missing env');
  });
});
