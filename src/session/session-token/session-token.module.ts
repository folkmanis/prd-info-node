import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { SessionTokenService } from './session-token.service';

// TODO
const SECRET = 'IvI3cS3wIZ';

@Module({
  imports: [
    JwtModule.register({
      secret: SECRET,
      signOptions: {
        expiresIn: '1h', // TODO
      },
    }),
  ],
  providers: [SessionTokenService],
  exports: [SessionTokenService],
  controllers: [],
})
export class SessionTokenModule {}
