import { IsIn, IsMongoId, IsNumber, Min } from 'class-validator';

export class WalletDto {
	@IsNumber()
	@Min(0)
	amount: number;
  
	@IsIn(['NGN', 'USD'])
	currency: string;
  
	@Min(0)
	@IsNumber()
	dailyLimit: number;
  
	@IsMongoId()
	owner: string;

	@IsMongoId()
	_id: string;
}

