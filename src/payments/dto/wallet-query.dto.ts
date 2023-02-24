import { IsMongoId } from 'class-validator';

export class WalletQueryDto {

	@IsMongoId()
	id: string;
}

  