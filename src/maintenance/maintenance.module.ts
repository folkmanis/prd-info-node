import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from '../dot-env.config.js';
import { DatabaseModule } from '../database/database.module.js';
import { LoggingModule } from '../logging/logging.module.js';
import { MaintenanceService } from './maintenance.service.js';
import { JobsModule } from '../entities/jobs/jobs.module.js';

@Module({
  providers: [MaintenanceService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate,
    }),
    DatabaseModule,
    JobsModule,
    LoggingModule,
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule {}
