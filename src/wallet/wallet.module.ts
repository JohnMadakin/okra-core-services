import { Module } from '@nestjs/common';
import { WalletController } from '../wallet/wallet.controller';
import { WalletService } from '../wallet/wallet.service';
import { UserModule } from '../users/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Wallet, WalletSchema } from '../wallet/wallet.schema';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: WalletSchema }]),
    UserModule, AuthModule
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService]
})
export class WalletModule {}
