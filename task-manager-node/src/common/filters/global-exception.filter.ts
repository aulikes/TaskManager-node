import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain.exception';
import { MessagePublishingException } from '../exceptions/message-publishing.exception';


@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    // BadRequestException → errores de validación
    if (exception instanceof BadRequestException) {
      const res: any = exception.getResponse();
      const message = Array.isArray(res.message) ? res.message : [res.message];

      const error = {
        statusCode: HttpStatus.BAD_REQUEST,
        message,
        error: 'Bad Request',
        code: 'VALIDATION_ERROR',
        timestamp,
        path,
      };

      this.logger.warn(`[400] ${JSON.stringify(message)}`);
      response.status(HttpStatus.BAD_REQUEST).json(error);
      return;
    }

    // NotFoundException → recurso no encontrado
    if (exception instanceof NotFoundException) {
      const res: any = exception.getResponse();
      const message = res?.message || 'Resource not found';

      const error = {
        statusCode: HttpStatus.NOT_FOUND,
        message,
        error: 'Not Found',
        code: 'NOT_FOUND',
        timestamp,
        path,
      };

      this.logger.warn(`[404] ${message}`);
      response.status(HttpStatus.NOT_FOUND).json(error);
      return;
    }

    // MessagePublishingException (errores al publicar eventos)
    if (exception instanceof MessagePublishingException) {
      const status = HttpStatus.INTERNAL_SERVER_ERROR;

      const error = {
        statusCode: status,
        message: exception.message,
        error: 'MessagePublishingException',
        exchange: exception.exchange,
        routingKey: exception.routingKey,
        reason: exception.reason,
        timestamp,
        path,
      };

      this.logger.error(`[500] Error al publicar en RabbitMQ: ${exception.reason}`);
      response.status(status).json(error);
      return;
    }
    
    // DomainException → errores de negocio
    if (exception instanceof DomainException) {
      const status = exception.statusCode ?? HttpStatus.UNPROCESSABLE_ENTITY;

      const error = {
        statusCode: status,
        message: exception.message,
        error: exception.code,
        code: 'DOMAIN_EXCEPTION',
        timestamp,
        path,
      };

      this.logger.warn(`[${status}] ${exception.message}`);
      response.status(status).json(error);
      return;
    }

    // Otras HttpExceptions
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res: any = exception.getResponse();
      const message = res?.message || exception.message;

      const error = {
        statusCode: status,
        message,
        error: res?.error || exception.name,
        code: 'HTTP_EXCEPTION',
        timestamp,
        path,
      };

      this.logger.warn(`[${status}] ${message}`);
      response.status(status).json(error);
      return;
    }

    // Errores inesperados → 500
    const error = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: (exception as any)?.message || 'UnknownError',
      code: 'INTERNAL_ERROR',
      timestamp,
      path,
    };

    this.logger.error(`[500] ${error.error}`, (exception as any)?.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}
