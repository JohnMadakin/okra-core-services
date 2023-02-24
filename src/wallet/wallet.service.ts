import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from './wallet.schema';
import { Model, ObjectId } from 'mongoose';
import { CreateUserWalletDto } from './dto/create-wallet.dto';
import { Wallets } from 'src/global/types';
// import { UserService } from 'src/users/user.service';


@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<WalletDocument>,

  ) {}

  async create(createWalletDto: CreateUserWalletDto): Promise<Wallet> {
    try {
      const createdWallet = new this.walletModel(createWalletDto);
      const savedWallet = await createdWallet.save();
      return savedWallet.toObject({ versionKey: false, getters: true, transform: (doc, ret) => {
        const { _id, __v, isDeleted,...wallet } = ret;
        wallet.id = _id;
        return wallet;
      }});    
    } catch (error) {
      if(error.code === 11000) {
        throw new ConflictException(`User already had ${createWalletDto.currency} wallet`);
      }

      throw new InternalServerErrorException('Unable to create new wallet');
    }
  }

  async findAll(userId: string | ObjectId, currency?: string): Promise<Wallets[]> {
    const fieldsToExclude = '-__v';
    const filter = currency ? { owner: userId, currency, isDeleted: false } : { owner: userId, isDeleted: false };

    const wallets = await this.walletModel.find(filter)
    .sort({ currency: -1 })
    .select(fieldsToExclude)
    .lean();

    const normaizedwallets = wallets.map(doc => {
      const { _id, ...w } = doc;
      return {
        id: _id,
        ...w,
      }
    });

    return normaizedwallets;
  }

  async findOne(userId: string | ObjectId, walletId: string): Promise<Wallets> {
    const fieldsToExclude = '-__v';
    const filter = { owner: userId, _id: walletId, isDeleted: false };

    const wallet = await this.walletModel.findOne(filter)
    .select(fieldsToExclude)
    .lean();

    if(!wallet) throw new NotFoundException('Wallet not found');

    const { _id, ...normalizedWallet } = wallet;
    return {
      id: _id,
      ...normalizedWallet,
    };
  }

}
