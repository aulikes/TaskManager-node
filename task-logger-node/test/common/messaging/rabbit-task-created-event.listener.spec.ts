// test/common/messaging/rabbit-task-created-event.listener.spec.ts

import { TaskCreatedListener } from '../../../src/common/messaging/rabbit-task-created-event.listener';
import { RabbitMqListenerService } from '../../../src/common/messaging/rabbitmq-listener.service';
import { TaskCreatedService } from '../../../src/task/service/task-created.service';
import { AppLogger } from '../../../src/logger/app.logger';
import { BadRequestException } from '@nestjs/common';

describe('TaskCreatedListener', () => {
  let listener: TaskCreatedListener;
  let mockListenerService: RabbitMqListenerService;
  let mockTaskCreatedService: TaskCreatedService;
  let mockLogger: AppLogger;

  // Se define un objeto de canal simulado que permite capturar y verificar llamadas a ack/nack/consume
  const mockChannel = {
    consume: jest.fn(), // Se espía la función que se usa para comenzar a consumir mensajes
    ack: jest.fn(),     // Se espía la función para confirmar recepción de mensajes exitosos
    nack: jest.fn(),    // Se espía la función para rechazar mensajes (con o sin reintento)
  };

  beforeEach(() => {
    // Se crea un mock del servicio que conecta a RabbitMQ, retornando un canal y nombre de cola simulados
    mockListenerService = {
      connectToQueue: jest.fn().mockResolvedValue({
        channel: mockChannel,
        queue: 'TASK_CREATED_QUEUE',
      }),
    } as unknown as RabbitMqListenerService;

    // Se simula el servicio de negocio encargado de persistir el evento en MongoDB
    mockTaskCreatedService = {
      saveEvent: jest.fn(),
    } as unknown as TaskCreatedService;

    // Se simula el logger de aplicación para capturar logs sin mostrar salida en consola
    mockLogger = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as AppLogger;

    // Se crea una instancia real del listener bajo prueba, inyectando las dependencias simuladas
    listener = new TaskCreatedListener(mockListenerService, mockTaskCreatedService, mockLogger);
  });

  afterEach(() => {
    // Se limpia el historial de llamadas de todos los mocks entre pruebas para evitar contaminación de resultados
    jest.clearAllMocks();
  });

  it('should acknowledge message after successful processing', async () => {
    // Este caso prueba el flujo exitoso:
    // Si el mensaje es válido y la operación `saveEvent` no lanza error, se debe confirmar con `ack`.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ id: '123', name: 'Test task' })),
    };

    // Se simula el consumo de un mensaje, invocando manualmente el callback entregado por el listener
    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    // Se espera que la función de guardado haya sido invocada correctamente con el payload
    expect(mockTaskCreatedService.saveEvent).toHaveBeenCalledWith({ id: '123', name: 'Test task' });

    // Se espera que el mensaje haya sido confirmado como exitosamente procesado
    expect(mockChannel.ack).toHaveBeenCalledWith(mockMsg);
  });

  it('should nack on BadRequestException without retry', async () => {
    // Este caso prueba que si ocurre una BadRequestException,
    // el mensaje se descarte sin reintento utilizando nack con requeue = false.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({})),
    };

    // Se configura `saveEvent` para lanzar explícitamente un BadRequestException
    mockTaskCreatedService.saveEvent = jest.fn().mockRejectedValue(
      new BadRequestException('Invalid data')
    );

    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    // Se espera que el mensaje haya sido descartado (nack sin reintento)
    expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);

    // Se espera que el logger haya registrado el mensaje de advertencia
    expect(mockLogger.warn).toHaveBeenCalledWith('Error capturado: Invalid data');
  });

  it('should nack on duplicate Mongo error without retry', async () => {
    // Este test valida el comportamiento ante errores de duplicado (código 11000 de MongoDB),
    // lo cual representa un evento ya procesado anteriormente.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ id: 'abc' })),
    };

    const mongoDuplicateError = {
      name: 'MongoServerError',
      code: 11000,
    };

    // Se simula que `saveEvent` lanza el error específico de duplicado
    mockTaskCreatedService.saveEvent = jest.fn().mockRejectedValue(mongoDuplicateError);

    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    await listener.onModuleInit();

    // Se espera que el mensaje se descarte sin reintento
    expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);

    // Se espera que se registre el log de evento duplicado
    expect(mockLogger.warn).toHaveBeenCalledWith('Duplicate event skipped', 'TaskCreatedListener');
  });

  it('should nack on unexpected error and log it', async () => {
    // Este test simula un error inesperado (ej. caída de base de datos)
    // y verifica que se realice un nack con posibilidad de reintento
    // y se registre un error en el log.

    const mockMsg = {
      content: Buffer.from(JSON.stringify({ task: 'fail' })),
    };

    const unexpectedError = new Error('DB crash');

    // Se configura el servicio para lanzar un error genérico
    mockTaskCreatedService.saveEvent = jest.fn().mockRejectedValue(unexpectedError);

    // Se simula el consumo del mensaje
    mockChannel.consume.mockImplementationOnce((_queue, callback) => {
      callback(mockMsg);
    });

    // Se simula la inicialización del listener, que debería intentar consumir mensajes
    await listener.onModuleInit();

    // Se espera que el mensaje se haya rechazado (nack), pero permitiendo reintento futuro
    expect(mockChannel.nack).toHaveBeenCalledWith(mockMsg, false, false);

    // Se espera que se registre un log de error con el mensaje adecuado
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Failed to persist event to MongoDB',
      unexpectedError
    );
  });
});
