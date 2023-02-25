import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../users/user.service';
import { LoginUserDto } from '../auth/dto/login-user.dto';
import { User } from '../users/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}
  private logger = new Logger(AuthService.name);
  private readonly JWT: string = 'JWT_SECRET';

  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const user = await this.validateUser(loginUserDto.email, loginUserDto.password);

    const payload = { id: user._id };    
    return {
        accessToken: this.jwtService.sign(
            payload, 
            { secret: this.configService.get<string>(this.JWT) }
        ),
    };
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userService.findByEmail(email, { select: '+password'});
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return user;
  }

  verifyJwt(token: string) {
    const jwtSecret = this.configService.get(this.JWT);

    try {
        return this.jwtService.verify(token, { secret: jwtSecret});

    } catch (e) {
      this.logger.warn(e);
      return null;
    }
  }
}
