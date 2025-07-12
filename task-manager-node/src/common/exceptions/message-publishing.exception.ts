import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Excepción lanzada cuando ocurre un error al intentar publicar un mensaje en RabbitMQ.
 */
export class MessagePublishingException extends HttpException {
  constructor(
    public readonly reason: string,
    public readonly exchange: string,
    public readonly routingKey: string,
  ) {
    super(
      {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to publish message to exchange "${exchange}" with routing key "${routingKey}"`,
        reason,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
