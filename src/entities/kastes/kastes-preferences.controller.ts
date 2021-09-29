import { Body, Controller, Get, Patch, Post } from '@nestjs/common';
import { Modules } from '../../login';
import { Usr } from '../../session';
import { ModuleUserPreferences, UsersService } from '../users';

@Controller('kastes/preferences')
@Modules('kastes')
export class KastesPreferencesController {

    constructor(
        private readonly usersService: UsersService,
    ) { }

    @Get()
    async getPreferences(
        @Usr('username') username: string
    ) {
        return this.usersService.getModulePreferences(username, 'kastes');
    }

    @Patch()
    async setPreferences(
        @Usr('username') username: string,
        @Body() preferences: ModuleUserPreferences,
    ) {
        return this.usersService.setModulePreferences(username, 'kastes', preferences);
    }

}