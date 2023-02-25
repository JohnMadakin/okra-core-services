import { Module, forwardRef } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UserModule } from '../users/user.module';
import { AuthController } from '../auth/auth.controller';
import { AuthService } from '../auth/auth.service';


@Module({
  imports: [forwardRef(() => UserModule)],
  controllers: [AuthController],
  providers: [AuthService, JwtService],
  exports: [AuthService]
})
export class AuthModule {}
