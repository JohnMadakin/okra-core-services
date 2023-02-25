import { IsMongoId } from 'class-validator';

export class WalletQueryDto {

	@IsMongoId({ message: 'Invalid wallet id'})
	id: string;
}

  