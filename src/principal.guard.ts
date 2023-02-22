import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class PrincipalGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.slice(7, authorization.length);
      try {
        const user = this.jwtService.verify(token);
        request.user = user;
        return true;
      } catch {}
    }
    return false;
  }
}
