import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { CurrencyEnum } from '../global/types';
import { User } from 'src/users/user.schema';


export type DailyLedgerDocument = DailyLedger & Document;

@Schema()
export class DailyLedger {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id: string

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: User.name, 
    auto: true,
  })
  owner: User

  @Prop({ required: true, trim: true, enum: CurrencyEnum })
  currency: string;

  @Prop({ default: 0 })
  totalAmount: number;

  @Prop({ required: true, trim: true })
  dayTs: string;

  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}


export const DailyLedgerSchema = SchemaFactory.createForClass(DailyLedger);
DailyLedgerSchema.index({ owner: 1, dayTs: 1 }, { unique: true });
