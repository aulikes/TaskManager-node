import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AppLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    // Asegura que el directorio 'logs' exista
    const logDir = path.resolve(__dirname, '..', '..', 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),            // Agrega timestamp
        winston.format.json()                  // Salida en formato JSON estructurado
      ),
      defaultMeta: { service: 'task-logger-node' }, // Cambia este nombre según el microservicio
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({
          filename: path.join(logDir, 'app.log'), // Salida a archivo ./logs/app.log
          level: 'info'
        }),
      ],
    });
  }

  log(message: any, context?: string) {
    this.logger.info({ message, context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error({ message, trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn({ message, context });
  }

  debug(message: any, context?: string) {
    this.logger.debug({ message, context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose({ message, context });
  }
}
