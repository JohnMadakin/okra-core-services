import { IsOptional, IsDateString, IsNumber } from 'class-validator';

export class UserQueryDto {

	@IsDateString()
	@IsOptional()
	cursor: string;

	@IsNumber()
	@IsOptional()
	limit: number;
}

  