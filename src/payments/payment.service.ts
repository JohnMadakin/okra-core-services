import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomBytes } from 'crypto';
import { Payment, PaymentDocument } from './Payment.schema';
import { ClientSession, Model } from 'mongoose';
import { CreatedPaymentDto, IntiatePaymentDto, PaymentDto, Payment as PaymentEntry } from './dto/Payment.dto';
import { WalletService } from 'src/wallet/wallet.service';
import { DailyLedger, DailyLedgerDocument } from './daily-ledger.schema';
import { getDateParts, roundNumber } from 'src/utils/utils';
import { NormalizedPayment, NormalizedPaymentEntry, NormalizedPaymentResponse, UnNormalizedPayment } from 'src/global/types';


@Injectable()
export class PaymentService {
  constructor(
    @InjectModel(Payment.name) private readonly paymentModel: Model<PaymentDocument>,
    @InjectModel(DailyLedger.name) private readonly dailyLedgerModel: Model<DailyLedgerDocument>,
    private walletService: WalletService,

  ) {}
  private readonly today = getDateParts(new Date());

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

      const paymentEntry = { walletToCredit, walletToDebit, 
        currency,ref, debitOwner: debitWalletItems.id, creditOwner: creditWalletItems.id, 
        amount, newCreditBalnce: creditBalance, newDebitBalnce: debitBalance, 
        oldCreditBalnce: creditWalletItems.amount , oldDebitBalnce: debitWalletItems.amount, meta: metaData
      }
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
        result.creditWallet = payment.creditWallet;
        result.debitWallet = payment.debitWallet;
        result.currency = payment.currency;
        result.ref = payment.ref;
        result.providerRef = payment.providerRef;
        result.owner = payment.owner;
        result.amount = payment.amount;
        result.status = payment.status;
        result.metadata = payment.metaData;
      }
    });
    return result;
  }

  normalizePaymentLedgerEntry(paymentEntry:  NormalizedPaymentEntry): PaymentEntry[] {
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

  async updateDailyLedger(wallet: string, amount: number, session: ClientSession): Promise<DailyLedger> {
    const dayTs = `${this.today.day}${this.today.month}${this.today.year}`;
    const dailyLedger = await this.dailyLedgerModel.findOneAndUpdate({ dayTs, wallet }, 
      { $inc: { totalAmount: amount } }, { new: true, upsert: true, session }).populate('wallet').exec();
    return dailyLedger;
  }
}
