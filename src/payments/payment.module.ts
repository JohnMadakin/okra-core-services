import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Payment, PaymentSchema } from './Payment.schema';
import { DailyLedger, DailyLedgerSchema } from './daily-ledger.schema';
import { WalletModule } from 'src/wallet/wallet.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/users/user.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }, { name: DailyLedger.name, schema: DailyLedgerSchema }]),
    WalletModule, AuthModule, UserModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}

