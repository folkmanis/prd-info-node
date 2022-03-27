import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Oauth2Service } from '../../google/oauth2/oauth2.service';
import { LoginService } from '../../login/login.service';
import { User, UsersService } from '../../entities/users';
import { InvalidGoogleUserException } from '../filters/invalid-google-user.filter';


@Injectable()
export class GoogleOauth2Guard implements CanActivate {


  constructor(
    private loginService: LoginService,
    private oauth2Service: Oauth2Service,
    private usersService: UsersService,
  ) { }


  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {

    const req = context.switchToHttp().getRequest() as Request;

    if (this.oauth2Service.redirectPath === req.path) {

      if (req.query.error) {
        throw new InvalidGoogleUserException(req.query.error);
      }

      assertString(req.query.state);
      assertString(req.query.code, 'No response code from google received');

      const tokens = await this.oauth2Service.getCredentials(req.query.code, req.query.state, req.session.id);
      req.session.oauth2 = {
        tokens,
      };

      const profile = await this.oauth2Service.getUserProfile(tokens);
      assertString(profile.email, 'User has no email');

      try {

        const user = await this.loginService.validateEmail(profile.email);
        req.session.user = await this.usersService.setGoogleUser(user.username, profile);

      } catch (error) {
        throw new InvalidGoogleUserException(error);
      }


      return true;

    } else {

      const url = await this.oauth2Service.getAuthUrl(req.session.id);
      req.session.oauth2 = {
        url,
      };

      return true;

    }


  }

}

function assertString(value: unknown, message = 'Invalid params'): asserts value is string {
  if (typeof value !== 'string') throw new InvalidGoogleUserException(message);

}