import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service.js';
import { UsersModule } from '../entities/users/index.js';
import { PreferencesDao } from './dao/preferencesDao.service.js';
import { PreferencesController } from './preferences.controller.js';
import { providePreferencesCollection } from './dao/preferences-collection.provider.js';

@Module({
  imports: [UsersModule],
  providers: [providePreferencesCollection, PreferencesService, PreferencesDao],
  exports: [PreferencesService],
  controllers: [PreferencesController],
})
export class PreferencesModule {}
