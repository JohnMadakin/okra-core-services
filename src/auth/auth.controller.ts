import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller('')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response) {
    const accessToken = await this.authService.login(loginUserDto);
    res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Login successful',
      data: accessToken,
    });
  }
}

