import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { User } from '../entities/users';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') { }
