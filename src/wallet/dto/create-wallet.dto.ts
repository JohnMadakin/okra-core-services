import { IsIn, IsMongoId, IsNumber, IsNumberString, Min } from 'class-validator';
import { ObjectId } from 'mongoose';

export class CreateWalletDto {

  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn(['NGN', 'USD'])
  currency: string;

  @Min(0)
  @IsNumber()
  dailyLimit: number;
}

export class CreateUserWalletDto {

  @IsNumber()
  @Min(0)
  amount: number;

  @IsIn(['NGN', 'USD'])
  currency: string;

  @Min(0)
  @IsNumber()
  dailyLimit: number;

  @IsMongoId()
  owner: string | ObjectId;
}
