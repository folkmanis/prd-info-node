import { NestFactory } from '@nestjs/core';
import { MaintenanceModule } from './maintenance/maintenance.module';
import { DatabaseService } from './database/database.service';
import { MaintenanceService } from './maintenance/maintenance.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MaintenanceModule);

  // app.useLogger(app.get(APP_LOGGER));
  await app.get(MaintenanceService).performTasks();

  await app.close();
  await app.get(DatabaseService).close();
}
bootstrap();
