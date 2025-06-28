import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from '../controller/health.controller';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { CustomHealthIndicator } from '../service/health.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [TerminusModule, TypeOrmModule, ConfigModule],
  controllers: [HealthController],
  providers: [TypeOrmHealthIndicator, CustomHealthIndicator],
})
export class HealthModule {}
