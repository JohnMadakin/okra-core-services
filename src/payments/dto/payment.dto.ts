import { IsIn, IsMongoId, IsNumber, Min, IsObject, IsString, IsAlphanumeric, Max, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ObjectId } from 'mongoose';
import { MetaData } from 'src/global/types';

export class PaymentDto {
	@IsNumber()
	@Min(1)
	amount: number;
  
	@IsIn(['NGN', 'USD'])
	currency: string;
    
	@IsMongoId()
	owner: string;

	// @IsString()
	// status: string;

	@IsMongoId()
	walletToDebit: string;

	@IsMongoId()
	walletToCredit: string;

	@IsObject()
	metaData: Object;

	@IsAlphanumeric()
	@Min(5)
	@Max(50)
	ref: string;

	// @IsMongoId()
	// _id: string;
}

export class CreatedPaymentDto {
	@IsNumber()
	@Min(1)
	amount: number;
  
	@IsIn(['NGN', 'USD'])
	currency: string;
    
	@IsMongoId()
	owner: string | ObjectId;

	@IsString()
	status: string;

	@IsString()
	type: string;

	@IsMongoId()
	debitWallet: string | ObjectId;

	@IsMongoId()
	creditWallet: string | ObjectId;

	@IsObject()
	metaData?: Object;

	@IsAlphanumeric()
	@Min(5)
	@Max(50)
	ref: string;

	// @IsMongoId()
	// _id: string;
}

export class IntiatePaymentDto {
	@IsNumber()
	@Min(0)
	amount: number;
  
	@IsIn(['NGN', 'USD'])
	currency: string;

	@IsMongoId({ message: 'Invalid walletToDebit format'})
	walletToDebit: string;

	@IsMongoId({ message: 'Invalid walletToCredit format'})
	walletToCredit: string;

	@IsObject()
	@IsOptional()
	metaData: Object;

	@IsAlphanumeric()
	@MinLength(5)
	@MaxLength(50)
	ref: string;
}

export interface Payment {
  _id?: string;
  owner: string | ObjectId;
  debitWallet: string | ObjectId;
  creditWallet: string | ObjectId;
  ref: string;
  providerRef: string;
  type: string;
  currency: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  status: string;
  metaData: MetaData;
  isDeleted?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
