import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Payment, PaymentDocument } from './Payment.schema';
import { ClientSession, Model } from 'mongoose';
import { CreatedPaymentDto, IntiatePaymentDto, PaymentDto } from './dto/Payment.dto';
import { WalletService } from 'src/wallet/wallet.service';
import { DailyLedger, DailyLedgerDocument } from './daily-ledger.schema';
import { getDateParts, roundNumber } from 'src/utils/utils';
import { NormalizedPayment, PaymentEntry, NormalizedPaymentEntry, NormalizedPaymentResponse, UnNormalizedPayment, SingleNormalizedPayment, PaginatedNormalizedPayment } from 'src/global/types';


@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(DailyLedger.name) private readonly dailyLedgerModel: Model<DailyLedgerDocument>,
    private walletService: WalletService,

  ) {}
  private readonly today = getDateParts(new Date());
  private readonly LIMIT: number = 10;

  async initiate(intiatePaymentDto: PaymentDto): Promise<NormalizedPaymentResponse | void> {
    const session = await this.paymentModel.db.startSession();
    session.startTransaction();
    try {
      const { walletToCredit, walletToDebit, currency, owner, amount, ref, metaData } = intiatePaymentDto;

      if(walletToCredit === walletToDebit) 
        throw new BadRequestException(`You can't initiate payment on the same debit and credit wallet`);
      
      const invalidRef = await this.findOne(ref, owner, session);

      if(invalidRef) throw new BadRequestException(`${intiatePaymentDto.ref} is a duplicate reference`);

      // refrain from using Promise.all() due to the use of mongodb transaction error 251
      const creditWalletItems = await this.walletService.findWallet(walletToCredit, currency, null, session);
      const debitWalletItems = await this.walletService.findWallet(walletToDebit, currency, owner, session);

      if(!debitWalletItems) 
        throw new UnauthorizedException('Not authorize to initate payment on this wallet');

      if(!creditWalletItems) 
        throw new BadRequestException(`walletToCredit is not a valid ${currency} wallet`);
              
      // Calculate the new balances
      const debitBalance = roundNumber(debitWalletItems.amount - amount, 2);
      const creditBalance = roundNumber(creditWalletItems.amount + amount, 2);

      if(debitBalance < 0) throw new 
        BadRequestException('Inssufficient Balance');

      const dailyLedger = await this.updateDailyLedger(walletToDebit, amount, session);

      // handles daily limits
      if(dailyLedger.totalAmount >= dailyLedger.wallet.dailyLimit) 
        throw new BadRequestException(`Wallet ${walletToDebit} has exceeded daily limit`);

      const [debitAction, creditAction] = await Promise.all([
        this.walletService.fund({ amount: -amount, currency, owner, wallet: walletToDebit }, session),
        this.walletService.updateWallet(walletToCredit, currency, amount, session),
      ]);

      if(!debitAction) 
        throw new InternalServerErrorException('Error occured while updating your wallet');

      if(!creditAction) 
        throw new InternalServerErrorException('Error occured while funding target wallet');

      const paymentEntry = {
         walletToCredit: creditWalletItems._id, walletToDebit: debitWalletItems._id, 
        currency,ref, debitOwner: debitWalletItems.owner as any, creditOwner: creditWalletItems.owner as any, 
        amount, newCreditBalnce: creditBalance, newDebitBalnce: debitBalance, 
        oldCreditBalnce: creditWalletItems.amount , oldDebitBalnce: debitWalletItems.amount, meta: metaData
      };
      const normalizedPaymentEntry = this.normalizePaymentLedgerEntry(paymentEntry);
      const payments = await this.createPaymentLedger(normalizedPaymentEntry, session);
      // Commit the transaction
      await session.commitTransaction();
      return this.normalizePaymentResponse(payments);
    } catch (error) {
      await session.abortTransaction();
      if(error.code === 11000) {
        throw new ConflictException(`${intiatePaymentDto.ref} is a duplicate reference`);
      }
      throw error;
    } finally {
      // End the session
      session.endSession();
    }
  }

  normalizePaymentResponse(payments:  Payment[]): NormalizedPaymentResponse {
    const result: NormalizedPaymentResponse = {
      id: '',
      creditWallet: null,
      debitWallet: null,
      currency: '',
      ref: '',
      providerRef: '',
      owner: null,
      amount: 0,
      status: '',
      metadata: {}
    };
  
    payments.forEach(payment => {
      if (payment.type === 'debit') {
        result.id = payment._id;
        result.creditWallet = payment.creditWallet as any;
        result.debitWallet = payment.debitWallet as any;
        result.currency = payment.currency;
        result.ref = payment.ref;
        result.providerRef = payment.providerRef;
        result.owner = payment.owner as any;
        result.amount = payment.amount;
        result.status = payment.status;
        result.metadata = payment.metaData;
      }
    });
    return result;
  }

  normalizePaymentLedgerEntry(paymentEntry: PaymentEntry): NormalizedPaymentEntry[] {
    const randbytes =  randomBytes(15).toString('hex');;
    const sessionId =  `000000000000000${randomBytes(20).toString('hex')}`;
    const { walletToCredit, walletToDebit, 
      currency,ref, debitOwner, creditOwner, 
      amount, newCreditBalnce, newDebitBalnce, 
      oldCreditBalnce, oldDebitBalnce, meta 
    } = paymentEntry;
    return [
      {
        type: 'credit',
        currency,
        amount,
        debitWallet: walletToDebit,
        creditWallet: walletToCredit,
        ref: sessionId,
        owner: creditOwner,
        balanceBefore: oldCreditBalnce,
        balanceAfter: newCreditBalnce,
        providerRef: `OKRA-${randbytes}`.toUpperCase(),
        status: 'completed',
        metaData: {
          systemData: {
            initiatorReference: ref
          }
        }
      },
      {
        type: 'debit',
        currency,
        amount,
        debitWallet: walletToDebit,
        creditWallet: walletToCredit,
        ref,
        owner: debitOwner,
        balanceBefore: oldDebitBalnce,
        balanceAfter: newDebitBalnce,
        providerRef: `OKRA-${randbytes}`.toUpperCase(),
        status: 'completed',
        metaData: {
          systemData: {
            proof: sessionId
          },
          userData: meta
        }
      }
    ];
  }

  async createPaymentLedger(createdPaymentDto: CreatedPaymentDto[], session: ClientSession): Promise<Payment[]> {
    const createdPayment = await this.paymentModel.insertMany(createdPaymentDto, { session });
    return createdPayment;
  }

  async findDailyLedger(wallet: string, session: ClientSession): Promise<DailyLedger> {
    const dayTs = `${this.today.day}${this.today.month}${this.today.year}`;
    const dailyLedger = await this.dailyLedgerModel.findOne({ dayTs, wallet }).session(session).exec();
    return dailyLedger;
  }

  async findOne(ref: string, owner: string, session: ClientSession): Promise<Payment> {
    return this.paymentModel.findOne({ ref, owner }).session(session).exec();
  }

  async findById(id: string, owner: string): Promise<SingleNormalizedPayment> {
    const payment = await this.paymentModel.findOne({ _id: id, owner }).lean();

    if(!payment) throw new NotFoundException('Payment id not found');
    const { __v, _id, type, isDeleted, updatedAt,...normalizedPayment } = payment;
    return {
      id: _id,
      ...normalizedPayment,
    };
  }

  // Todu: rework
  async findAll(owner: string, nextCursor: string, previousCursor: string, limit: number): Promise<PaginatedNormalizedPayment | { payments: [] }> {
    const query: { _id?: object, owner: string, nextCursor?: string | null, previousCursor?: string | null } = { owner };
    const sort = { _id: -1 }
    if (previousCursor) {
      query._id = { $gt: previousCursor }
      sort._id = 1
    } else if (nextCursor) {
      query._id = { $lt: nextCursor }
    }

    const payments = await this.paymentModel.find(query)
    .sort({ _id: previousCursor ? 1 : -1 })
    .limit(limit || this.LIMIT)
    .lean();

    if(!payments.length) return { payments: payments as [], nextCursor: null, previousCursor: null };
    if (query.previousCursor) payments.reverse();

    let hasNext, hasPrev, lastItem, firstItem;
    lastItem = payments[payments.length - 1]._id
    firstItem = payments[0]._id
  
    // If there is an item with id less than last item (remember, sort is in desc _id), there is a next page
    const q = { _id: { $lt: lastItem } }
    const r =  await this.paymentModel.findOne(q);
    if (r) {
      hasNext = true
    }
    // If there is an item with id greater than first item (remember, sort is in desc _id), there is a previous page
    hasPrev = !!await this.paymentModel.findOne({ _id: { $gt: firstItem }});

    const response: PaginatedNormalizedPayment = {
      payments,
      nextCursor: '',
      previousCursor: '',
      hasNextPage: hasNext,
    }
    if (hasNext) {
      response.nextCursor = `${lastItem}`
    }
    if (hasPrev) {
      response.previousCursor = `${firstItem}`
    }    
    response.payments = payments.map(payment => {
    const { __v, _id, type, isDeleted, updatedAt,...normalizedPayment } = payment;
    return {
      id: _id,
      ...normalizedPayment,
      }
    });
    return response;
  }

  async updateDailyLedger(wallet: string, amount: number, session: ClientSession): Promise<DailyLedger> {
    const dayTs = `${this.today.day}${this.today.month}${this.today.year}`;
    const dailyLedger = await this.dailyLedgerModel.findOneAndUpdate({ dayTs, wallet }, 
      { $inc: { totalAmount: amount } }, { new: true, upsert: true, session }).populate('wallet').exec();
    return dailyLedger;
  }
}
