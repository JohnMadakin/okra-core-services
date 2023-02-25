import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Date, Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

import { User, UserDocument } from './user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { NormalizedUser, PaginatedUsers }  from '../global/types';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}
  private readonly LIMIT: number = 4;

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

  async findOneById(id: string): Promise<NormalizedUser> {
    const user = await this.userModel.findById(id).lean();

    if(!user) throw new NotFoundException('User not found');
    const { _id,__v, ...normalizedUsers } = user;
    return {
      id: _id,
      ...normalizedUsers,
    };
  }

  async findAll(cursor?: string, limit?: number): Promise<PaginatedUsers> {
    const filter = cursor ? { createdAt: { $lt: new Date(cursor) }, isDeleted: false } : { isDeleted: false };
    const pageLimit = limit || this.LIMIT;
    const fieldsToExclude = '-__v';

    const users = await this.userModel.find(filter)
    .sort({ createdAt: -1 })
    .limit(pageLimit + 1)
    .select(fieldsToExclude)
    .lean();

    const hasNextPage = users.length > pageLimit;

    if (hasNextPage) {
      users.pop();
    }

    const normaizedUsers = users.map(doc => {
      const { _id, ...u } = doc;
      return {
        id: _id,
        ...u,
      }
    });

    return { 
      users: normaizedUsers, 
      hasNextPage, 
      cursor: hasNextPage ? normaizedUsers[normaizedUsers.length - 1].createdAt.toISOString() : null 
    };
  }
}
