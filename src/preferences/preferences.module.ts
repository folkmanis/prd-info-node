import { Module } from '@nestjs/common';
import { PreferencesService } from './preferences.service';
import { UsersModule } from '../entities/users';
import { PreferencesDao } from './dao/preferencesDao.service';
import { PreferencesController } from './preferences.controller';

@Module({
  imports: [UsersModule],
  providers: [PreferencesService, PreferencesDao],
  exports: [PreferencesService],
  controllers: [PreferencesController],
})
export class PreferencesModule { }
