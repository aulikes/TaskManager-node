import { ApiProperty } from '@nestjs/swagger';

/**
 * Estructura estándar de las respuestas de error.
 * Usado en filters y documentado en Swagger.
 */
export class ErrorResponseDto {
  @ApiProperty({ example: 400, description: 'Código de estado HTTP' })
  statusCode: number;

  @ApiProperty({ example: 'Campo "title" es obligatorio', description: 'Mensaje descriptivo del error' })
  message: string | string[];

  @ApiProperty({ example: 'Bad Request', description: 'Tipo de error o código interno' })
  error: string;

  @ApiProperty({ example: '/tasks', description: 'Ruta de la solicitud fallida' })
  path: string;

  @ApiProperty({ example: '2025-07-12T05:00:00.123Z', description: 'Momento exacto del error' })
  timestamp: string;
}
