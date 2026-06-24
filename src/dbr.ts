import { NestFactory } from '@nestjs/core';
import { MaintenanceModule } from './maintenance/maintenance.module.js';
import { MaintenanceService } from './maintenance/maintenance.service.js';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(MaintenanceModule);

  // app.useLogger(app.get(APP_LOGGER));
  const service = app.get(MaintenanceService);
  await service.performTasks();

  await service.close();
  await app.close();
}
bootstrap();
