import { IsNotEmpty, IsString, IsEmail, IsDate } from 'class-validator';

export class UserDto {
	
	@IsEmail()
	email: string;
	
	@IsString()
	firstName: string;

	@IsString()
	lastName: string;

	@IsDate()
	createdAt: Date;

	@IsDate()
	updateAt: Date;
}
