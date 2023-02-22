import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userModel.findOne({ email }).exec();
  }

  async validateUser(email: string, password: string): Promise<User | undefined> {
    const user = await this.findByEmail(email);
    if (user && await user.validatePassword(password)) {
      return user;
    }
    return undefined;
  }

  async create(email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new this.userModel({ email, password: hashedPassword });
    return user.save();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}
