import { TaskUpdatedListener } from '../../../src/common/messaging/rabbit-task-updated-event.listener';
import { RabbitMqListenerService } from '../../../src/common/messaging/rabbitmq-listener.service';
import { TaskUpdatedService } from '../../../src/task/service/task-updated.service';
import { AppLogger } from '../../../src/logger/app.logger';
import { BadRequestException } from '@nestjs/common';

describe('TaskUpdatedListener', () => {
  let listener: TaskUpdatedListener;
  let mockListenerService: RabbitMqListenerService;
  let mockTaskUpdatedService: TaskUpdatedService;
  let mockLogger: AppLogger;

  // Se crea un objeto que simula las funciones básicas de un canal AMQP
  const mockChannel = {
    consume: jest.fn(),
    ack: jest.fn(),
    nack: jest.fn(),
  };

  beforeEach(() => {
    // Se simula el servicio de conexión a RabbitMQ para retornar un canal y cola
    mockListenerService = {
      connectToQueue: jest.fn().mockResolvedValue({
        channel: mockChannel,
        queue: 'TASK_UPDATED_QUEUE',
      }),
    } as unknown as RabbitMqListenerService;

    // Se simula el servicio que guarda eventos de actualización
    mockTaskUpdatedService = {
      saveEvent: jest.fn(),
    } as unknown as TaskUpdatedService;

    // Se simula el logger sin imprimir nada en consola
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLogger;

    // Se instancia el listener con los mocks simulados
    listener = new TaskUpdatedListener(mockListenerService, mockTaskUpdatedService, mockLogger);
  });

  afterEach(() => {
    // Se limpian todos los mocks después de cada prueba
    jest.clearAllMocks();
  });

  it('should acknowledge message after successful processing', async () => {
    // Este test valida que si el evento se procesa sin errores,
    // se llama a `ack()` para confirmar su recepción.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ id: '123', status: 'updated' })),
    };

    // Se simula el consumo de un mensaje con callback manual
    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    expect(mockTaskUpdatedService.saveEvent).toHaveBeenCalledWith({ id: '123', status: 'updated' });
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
  });

  it('should ack on BadRequestException and log warning', async () => {
    // Este test verifica que si se lanza una BadRequestException,
    // el mensaje se reconoce como inválido y se descarta usando `ack`.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({})),
    };

    mockTaskUpdatedService.saveEvent = jest.fn().mockRejectedValue(
      new BadRequestException('Missing required fields')
    );

    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Error capturado: Missing required fields',
      'TaskUpdatedListener'
    );
  });

  it('should nack on duplicate Mongo error without retry', async () => {
    // Este test verifica que si el evento ya fue procesado previamente,
    // el listener lo detecta como duplicado y lo descarta sin reintento usando `nack`.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ id: 'xyz' })),
    };

    const mongoDuplicateError = {
      name: 'MongoServerError',
      code: 11000,
    };

    mockTaskUpdatedService.saveEvent = jest.fn().mockRejectedValue(mongoDuplicateError);

    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);
    expect(mockLogger.warn).toHaveBeenCalledWith(
      'Duplicate event skipped',
      'TaskCreatedListener'
    );
  });

  it('should not ack or nack on unexpected error', async () => {
    // Este test valida que si ocurre un error inesperado,
    // no se confirme ni se descarte el mensaje, dejando que RabbitMQ lo reintente.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ field: 'fail' })),
    };

    const unexpectedError = new Error('DB connection lost');

    mockTaskUpdatedService.saveEvent = jest.fn().mockRejectedValue(unexpectedError);

    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    expect(mockChannel.ack).not.toHaveBeenCalled();
    expect(mockChannel.nack).not.toHaveBeenCalled();
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to persist event to MongoDB',
      unexpectedError
    );
  });
});
