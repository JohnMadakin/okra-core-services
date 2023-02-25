import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';


export type RefundGuardDocument = RefundGuard & Document;

@Schema()
export class RefundGuard {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id?: string

  @Prop({ required: true, trim: true, unique: true, index: true })
  paymentId: string;

  @Prop({ default: Date.now })
  createdAt?: Date;

  @Prop({ default: Date.now })
  updatedAt?: Date;
}


export const RefundGuardSchema = SchemaFactory.createForClass(RefundGuard);

