import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { DomainException } from '../exceptions/domain-exception'; 

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const timestamp = new Date().toISOString();
    const path = request.url;

    // 1. HttpException (como BadRequestException, NotFoundException, etc.)
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const errorResponse = exception.getResponse();

      const message =
        typeof errorResponse === 'string'
          ? errorResponse
          : (errorResponse as any).message || 'Error';

      const error = {
        statusCode: status,
        message,
        error: (errorResponse as any).error || exception.name,
        timestamp,
        path,
      };

      this.logger.warn(`[${status}] ${message}`);
      response.status(status).json(error);
      return;
    }

    // 2. DomainException (errores personalizados del negocio)
    if (exception instanceof DomainException) {
      const status = exception.statusCode ?? HttpStatus.UNPROCESSABLE_ENTITY;

      const error = {
        statusCode: status,
        message: exception.message,
        error: exception.code,
        timestamp,
        path,
      };

      this.logger.warn(`[${status}] ${exception.message}`);
      response.status(status).json(error);
      return;
    }

    // 3. Errores inesperados → 500
    const error = {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: (exception as any)?.message || 'UnknownError',
      timestamp,
      path,
    };

    this.logger.error(`[500] ${error.error}`, (exception as any)?.stack);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(error);
  }
}
