import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurrencyEnum } from '../global/types';
import { User } from 'src/users/user.schema';
import { ObjectId } from 'mongodb';


export type WalletDocument = Wallet & Document;

@Schema()
export class Wallet {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id?: string;

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: User.name, 
    auto: true,
  })
  owner: User

  @Prop({ required: true, trim: true, enum: CurrencyEnum })
  currency: string;

  @Prop({ default: 0 })
  amount: number;

  @Prop({ required: true })
  dailyLimit: number;

  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}


export const WalletSchema = SchemaFactory.createForClass(Wallet);
WalletSchema.index({ owner: 1, currency: 1 }, { unique: true });
