import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Modules } from '../../login/index.js';
import { Usr } from '../../session/index.js';
import { ModuleUserPreferences, UsersService } from '../users/index.js';

@Controller('kastes/preferences')
@Modules('kastes')
export class KastesPreferencesController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getPreferences(@Usr('username') username: string) {
    return this.usersService.getModulePreferences(username, 'kastes');
  }

  @Patch()
  async setPreferences(
    @Usr('username') username: string,
    @Body() preferences: ModuleUserPreferences,
  ) {
    return this.usersService.setModulePreferences(
      username,
      'kastes',
      preferences,
    );
  }
}
