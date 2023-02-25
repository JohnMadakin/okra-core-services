import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Wallet, WalletDocument } from '../wallet/wallet.schema';
import { ClientSession, Model, ObjectId } from 'mongoose';
import { CreateUserWalletDto } from '../wallet/dto/create-wallet.dto';
import { FundedWallet, WalletFilter, Wallets } from '../global/types';
import { CreateFundWalletDto } from '../wallet/dto/wallet.dto';


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

  async findWallet(walletId: string, currency?: string, owner?: string | null, session?: ClientSession ): Promise<Wallet | null> {
    const fieldsToExclude = '-__v';
    const filter: WalletFilter = currency ? { _id: walletId, currency, isDeleted: false } : { _id: walletId, isDeleted: false };

    if(owner) filter.owner = owner;

    const wallet = await this.walletModel.findOne(filter)
    .select(fieldsToExclude).session(session)
    .lean();

    if(!wallet) return null;
    return wallet
  }

  async fund(fundWalletDto: CreateFundWalletDto, session?: ClientSession | null): Promise<FundedWallet> {
    const fundWallet =  await this.walletModel.findOneAndUpdate({ 
      _id: fundWalletDto.wallet, owner: fundWalletDto.owner, currency: fundWalletDto.currency }, 
      { $inc: { amount: fundWalletDto.amount } }, { new: true, session });

    if(!fundWallet) throw new NotFoundException(`Not a valid ${fundWalletDto.currency}`);
    return {
      id: fundWallet._id,
      amount: fundWallet.amount,
      currency: fundWallet.currency,
    }
  }

  async updateWallet(wallet: string, currency:string, amount: number, session: ClientSession): Promise<FundedWallet> {
    const fundWallet =  await this.walletModel.findOneAndUpdate({ 
      _id: wallet, currency }, 
      { $inc: { amount } }, { new: true, session });

    if(!fundWallet) return null;
    return {
      id: fundWallet._id,
      amount: fundWallet.amount,
      currency: fundWallet.currency,
    }
  }

}
