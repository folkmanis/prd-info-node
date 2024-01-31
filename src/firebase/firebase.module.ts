import { DynamicModule, Module } from '@nestjs/common';
import { cert, initializeApp } from 'firebase-admin/app';

@Module({})
export class FirebaseModule {
  static forRoot(): DynamicModule {
    const firebaseConfigLocation =
      process.env.FIREBASE_ADMIN_CREDENTIALS || 'firebase.json';

    initializeApp({ credential: cert(firebaseConfigLocation) });
    return {
      module: FirebaseModule,
    };
  }
}
