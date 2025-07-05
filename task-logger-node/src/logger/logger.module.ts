import { Module } from '@nestjs/common';
import { AppLogger } from './app.logger';

@Module({
  imports: [],
  controllers: [],
  providers: [
    AppLogger,
  ],
  exports: [
    AppLogger,
  ],
})
export class LoggerModule {}
