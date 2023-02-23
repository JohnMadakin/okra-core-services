import { ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
      const createdUser = new this.userModel(createUserDto);
      const savedUser = await createdUser.save();
      return savedUser.toObject({ versionKey: false, getters: true, transform: (doc, ret) => {
        const { _id, __v, password, isDeleted,...user } = ret;
        user.id = _id;
        return user;
      }});    
    } catch (error) {
      if(error.code === 11000) {
        throw new ConflictException('User already exists');
      }

      throw new InternalServerErrorException('Unable to register user');
    }
  }

  async findByEmail(email: string, options: { select?: string }): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).select(options.select || '').exec();
    return user || null;
  }

  async findOneById(id: string): Promise<User> {
    return this.userModel.findById(id).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().exec();
  }
}

