import { Module } from '@nestjs/common';
import { PaymentController } from '../payments/payment.controller';
import { PaymentService } from '../payments/payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from '../payments/payment.schema';
import { DailyLedger, DailyLedgerSchema } from '../payments/daily-ledger.schema';
import { WalletModule } from '../wallet/wallet.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../users/user.module';
import { Refund, RefundSchema } from '../payments/refunds.schema';
import { RefundGuard, RefundGuardSchema } from '../payments/refund-guard.schema';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }, 
      { name: DailyLedger.name, schema: DailyLedgerSchema },
      { name: Refund.name, schema: RefundSchema },
      { name: RefundGuard.name, schema: RefundGuardSchema }
    ]),
    WalletModule, AuthModule, UserModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}

