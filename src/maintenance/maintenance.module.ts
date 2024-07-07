import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dotEnvConfig } from '../dot-env.config.js';
import { DatabaseModule } from '../database/database.module.js';
import { LoggingModule } from '../logging/logging.module.js';
import { MaintenanceService } from './maintenance.service.js';
import { JobsModule } from '../entities/jobs/jobs.module.js';

@Module({
  providers: [MaintenanceService],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: dotEnvConfig,
      cache: true,
    }),
    DatabaseModule,
    JobsModule,
    LoggingModule,
  ],
  exports: [MaintenanceService],
})
export class MaintenanceModule { }
