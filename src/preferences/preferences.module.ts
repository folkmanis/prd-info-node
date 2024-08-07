import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service.js';
import { UsersModule } from '../entities/users/index.js';
import { PreferencesDao } from './dao/preferencesDao.service.js';
import { PreferencesController } from './preferences.controller.js';

@Module({
  imports: [UsersModule],
  providers: [PreferencesService, PreferencesDao],
  exports: [PreferencesService],
  controllers: [PreferencesController],
})
export class PreferencesModule { }
