import { IsNotEmpty, IsString, IsEmail, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @IsString()
    @IsStrongPassword()
    password: string;
  
    // @IsNotEmpty()
    @IsString()
    firstName: string;

    // @IsNotEmpty()
    @IsString()
    lastName: string;
  }

  