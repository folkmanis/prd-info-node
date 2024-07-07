import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Modules } from '../../login/index.js';
import { Usr } from '../../session/index.js';
import { ModuleUserPreferences, UsersService } from '../users/index.js';

@Controller('jobs/preferences')
@Modules('jobs')
export class JobsPreferencesController {
  constructor(private readonly usersService: UsersService) { }

  @Get()
  async getPreferences(@Usr('username') username: string) {
    return this.usersService.getModulePreferences(username, 'jobs');
  }

  @Patch()
  async setPreferences(
    @Usr('username') username: string,
    @Body() preferences: ModuleUserPreferences,
  ) {
    return this.usersService.setModulePreferences(
      username,
      'jobs',
      preferences,
    );
  }
}
