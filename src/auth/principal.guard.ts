import { Injectable, CanActivate, ExecutionContext, ServiceUnavailableException, BadRequestException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ):  Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return false;
    }

    const token = authHeader.split(' ')[1];
    const decodedToken = this.authService.verifyJwt(token);
    
    if(!decodedToken) throw new BadRequestException('invalid token entered');

    const user = await this.userService.findOneById(decodedToken.id);

    if (!user) {
      return false;
    }

    request.user = user;
    return true;
  }
}
