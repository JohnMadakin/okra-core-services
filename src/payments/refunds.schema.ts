import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurrencyEnum, MetaData, RefundStatusEnum, RefundTypeEnum } from '../global/types';
import { User } from 'src/users/user.schema';
import { Wallet } from 'src/wallet/wallet.schema';
import { Payment } from './Payment.schema';


export type RefundDocument = Refund & Document;

@Schema()
export class Refund {
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
  debitedWallet: Wallet

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: Wallet.name, 
    auto: true,
    index: true,
  })  
  creditedWallet: Wallet;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: Wallet.name, 
    auto: true,
    index: true,
  })
  payment: Payment

  @Prop({ required: true, trim: true, unique: true, index: true })
  ref: string;

  @Prop({ required: true, trim: true, enum: RefundTypeEnum })
  type: string;

  @Prop({ default: 0 })
  amount: number;


  @Prop({ required: true, trim: true, enum: RefundStatusEnum, default: RefundStatusEnum.INITIATED })
  status: string;

  @Prop({ default: false, select: false })
  isDeleted?: boolean;

  @Prop({ default: Date.now, index: true })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}


export const RefundSchema = SchemaFactory.createForClass(Refund);

