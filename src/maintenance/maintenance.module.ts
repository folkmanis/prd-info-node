import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { dotEnvConfig } from '../dot-env.config';
import { DatabaseModule } from '../database/database.module';
import { LoggingModule } from '../logging/logging.module';
import { MaintenanceService } from './maintenance.service';
import { JobsModule } from '../entities/jobs/jobs.module';

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
export class MaintenanceModule {}
