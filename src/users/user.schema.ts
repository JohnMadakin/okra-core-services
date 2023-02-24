import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ auto: true, type: MongooseSchema.Types.ObjectId })
  _id: string

  @Prop({ required: true, trim: true })
  firstName: string;

  @Prop({ required: true, trim: true  })
  lastName: string;

  @Prop({ required: true, unique: true, index: true, trim: true  })
  email: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: false, select: false })
  isDeleted: boolean;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
  
}



export const UserSchema = SchemaFactory.createForClass(User);
