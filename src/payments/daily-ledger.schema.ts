import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Wallet } from 'src/wallet/wallet.schema';


export type DailyLedgerDocument = DailyLedger & Document;

@Schema()
export class DailyLedger {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id: string

  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    required: true, ref: Wallet.name, 
    auto: true,
    index: true,
  })
  wallet: Wallet

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
DailyLedgerSchema.index({ wallet: 1, dayTs: 1 }, { unique: true });
