import { Body, Controller, Get, Patch } from '@nestjs/common';
import { Modules } from '../../login';
import { Usr } from '../../session';
import { ModuleUserPreferences, UsersService } from '../users';

@Controller('jobs/preferences')
@Modules('jobs')
export class JobsPreferencesController {
  constructor(private readonly usersService: UsersService) {}

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
