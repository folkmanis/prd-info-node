import { Injectable } from '@nestjs/common';
import { getFirestore } from 'firebase-admin/firestore';
import { LoginCredentials, UsersDaoService } from './dao/users-dao.service';

@Injectable()
export class UsersFirebaseService {
  private readonly firestore = getFirestore();

  constructor(private usersDao: UsersDaoService) {}
}
