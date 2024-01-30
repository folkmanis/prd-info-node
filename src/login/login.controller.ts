import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Req,
  Session,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { Session as Sess } from 'express-session';
import {
  PasswordPipe,
  UpdateUserDto,
  User,
  UsersService,
  UserUpdateNotifyInterceptor,
  Usr,
} from '../entities/users';
import { ResponseWrapperInterceptor } from '../lib/response-wrapper.interceptor';
import { InstanceId } from '../preferences/instance-id.decorator';
import { SessionTokenService } from '../session/session-token';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { PublicRoute } from './public-route.decorator';
import { UpdateSessionUserInterceptor } from './update-session-user.interceptor';

@Controller('login')
export class LoginController {
  constructor(
    private readonly tokenService: SessionTokenService,
    private readonly usersService: UsersService,
  ) {}

  @UseGuards(LocalAuthGuard)
  @PublicRoute()
  @Post()
  async login(@Req() req: Request) {
    req.session.user = req.user as User;
    req.session.lastSeen = {
      ip: req.ip!,
      date: new Date(),
    };
    return req.session.user;
  }

  @Delete()
  @PublicRoute()
  @UseInterceptors(new ResponseWrapperInterceptor('response'))
  async logout(@Session() sess: Sess) {
    await new Promise((resolve) => sess.destroy(resolve));
    return 'logged out';
  }

  @Get('session-token')
  @UseInterceptors(
    UpdateSessionUserInterceptor,
    new ResponseWrapperInterceptor('data'),
  )
  generateToken(
    @Usr() user: User,
    @Session() session: Sess,
    @InstanceId() instanceId: string,
  ) {
    return this.tokenService.token(session, instanceId, user);
  }

  @Get('session-id')
  sessionId(@Session() session: Sess) {
    return {
      sessionId: session.id,
    };
  }

  @Get('avatar')
  async getAvatarPicture(@Usr() user: User) {
    const { avatar } = await this.usersService.getOneByUsername(user.username);
    if (!avatar) {
      throw new NotFoundException('No avatar picture for user');
    }

    return new StreamableFile(avatar.image.buffer, { type: avatar.type });
  }

  @Get()
  @UseInterceptors(UpdateSessionUserInterceptor)
  async user(@Usr() user: User | undefined) {
    return user;
  }

  @UsePipes(
    new ValidationPipe({ transform: true, whitelist: true }),
    PasswordPipe,
  )
  @UseInterceptors(UpdateSessionUserInterceptor, UserUpdateNotifyInterceptor)
  @Patch()
  async updateUser(@Usr() user: User, @Body() update: UpdateUserDto) {
    await this.usersService.updateUser(user.username, update);
    return this.usersService.getOneByUsername(user.username);
  }
}
