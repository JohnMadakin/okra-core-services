import { IsIn, IsMongoId, IsNumber, Min, IsObject, IsString, IsAlphanumeric, Max, IsOptional, MinLength, MaxLength } from 'class-validator';
import { ObjectId } from 'mongoose';

export class PaymentDto {
	@IsNumber()
	@Min(1)
	amount: number;
  
	@IsIn(['NGN', 'USD'])
	currency: string;
    
	@IsMongoId()
	owner: string;

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

export class PaymentParamsDto {
	@IsMongoId()
	id: string;
}

export class VerifyPaymentQueryDto {
	@IsOptional()
	@IsMongoId({ message: 'Please enter a valid refundId'})
	refundId: string;

	@IsOptional()
	@IsMongoId({
		message: 'Kindly enter a valid paymentId'
	})
	paymentId: string;
}

export class PaymentQueryDto {
	@IsMongoId()
	@IsOptional()
	nextCursor: string;

	@IsMongoId()
	@IsOptional()
	previousCursor: string;

	@IsOptional()
	@IsNumber()
	limit: number;
}

export class IntiateRefundDto {
	@IsNumber()
	@Min(1)
	amount: number;
  
	@IsMongoId({ message: 'Invalid payment Id'})
	payment: string;
}