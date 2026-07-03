import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ZodResponse } from 'nestjs-zod';
import { Modules } from '../login/index.js';
import { ModuleNameDto } from './dto/module-name.dto.js';
import { PreferencesUpdateDto } from './dto/preferences-update.dto.js';
import { PreferencesDto } from './dto/preferences.dto.js';
import { PreferencesService } from './preferences.service.js';

@Controller('preferences')
export class PreferencesController {
  constructor(private preferencesService: PreferencesService) {}

  @ZodResponse({ type: PreferencesDto })
  @Modules('admin')
  @Patch()
  async updateAll(@Body() preferences: PreferencesUpdateDto) {
    return this.preferencesService.updatePreferences(preferences);
  }

  @ZodResponse({ type: PreferencesDto })
  @Get(':module')
  async getPreferences(@Param() params: ModuleNameDto) {
    return this.preferencesService.getSystemPreferences({
      module: params.module,
    });
  }

  @ZodResponse({ type: PreferencesDto })
  @Get()
  async getAllPreferences() {
    return this.preferencesService.getSystemPreferences();
  }
}
