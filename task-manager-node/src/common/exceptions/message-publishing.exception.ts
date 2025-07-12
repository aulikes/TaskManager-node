import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción lanzada cuando ocurre un error al intentar publicar un mensaje en RabbitMQ.
 */
export class MessagePublishingException extends Error {
  constructor(
    public readonly reason: string,
    public readonly exchange: string,
    public readonly routingKey: string,
  ) {
    super(
      `Failed to publish message to exchange "${exchange}" with routing key "${routingKey}": ${reason}`,
    );
    this.name = 'MessagePublishingException';
  }
}

