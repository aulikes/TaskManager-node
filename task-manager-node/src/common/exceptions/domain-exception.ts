import { HttpStatus } from '@nestjs/common';

/**
 * Excepción base para errores de dominio del negocio.
 * Se puede usar para reglas como "ya existe", "no se puede eliminar", etc.
 */
export class DomainException extends Error {
  /**
   * Código de error interno (puede usarse para frontend o logs)
   * Ej: 'TASK_ALREADY_EXISTS'
   */
  readonly code: string;

  /**
   * Código HTTP que se desea devolver. Por defecto: 422
   */
  readonly statusCode: number;

  constructor(message: string, code = 'DOMAIN_ERROR', statusCode = HttpStatus.UNPROCESSABLE_ENTITY) {
    super(message); // mensaje visible
    this.code = code;
    this.statusCode = statusCode;

    // Necesario para mantener el stack trace correcto
    Object.setPrototypeOf(this, DomainException.prototype);
  }
}
