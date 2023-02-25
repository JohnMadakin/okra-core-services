import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurrencyEnum, MetaData, PaymentStatusEnum, PaymentTypeEnum } from '../global/types';
import { User } from 'src/users/user.schema';
import { Wallet } from 'src/wallet/wallet.schema';


export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id?: string

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: User.name, 
    auto: true,
  })
  owner: User

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: Wallet.name, 
    auto: true,
    index: true,
  })
  debitWallet: Wallet

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: Wallet.name, 
    auto: true,
    index: true,
  })
  creditWallet: Wallet

  @Prop({ required: true, trim: true })
  ref: string;

  @Prop({ required: true, trim: true, index: true })
  providerRef: string;

  @Prop({ required: true, trim: true, enum: PaymentTypeEnum })
  type: string;

  @Prop({ required: true, trim: true, enum: CurrencyEnum })
  currency: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ default: 0 })
  balanceBefore: number;

  @Prop({ default: 0 })
  balanceAfter: number;

  @Prop({ required: true, trim: true, enum: PaymentStatusEnum, default: PaymentStatusEnum.INITIATED })
  status: string;

  @Prop({ type: Object })
  metaData: MetaData;

  @Prop({ default: false, select: false })
  isDeleted?: boolean;

  @Prop({ default: Date.now, index: true })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}


export const PaymentSchema = SchemaFactory.createForClass(Payment);
PaymentSchema.index({ ref: 1, owner: 1 }, { unique: true });

