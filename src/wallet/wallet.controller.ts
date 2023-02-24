import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { WalletResponseDto, WalletsResponseDto } from './dto/wallet-api.dto';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Response } from 'express';
import { CurrentUser } from '../users/current-user.decorator';
import { PrincipalGuard } from 'src/auth/principal.guard';
import { NormalizedUser } from 'src/global/types';
import { WalletQueryDto } from './dto/wallet-query.dto';
import { FundWalletDto } from './dto/wallet.dto';


@Controller('wallets')
export class WalletController {
  constructor(private walletService: WalletService) {}
 
  @UseGuards(PrincipalGuard)
  @Post()
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'Create a wallet'
  })
  @ApiCreatedResponse({
      status: HttpStatus.CREATED,
      description: 'Wallet created successfully',
      type: WalletResponseDto
  })
  async create(@Body() createWalletDto: CreateWalletDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const createdWallet = await this.walletService.create({ ...createWalletDto, owner: user.id });

    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'Wallet created successfully',
      data: createdWallet,
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Get()
  @ApiOperation({
      summary: 'fetch a wallet'
  })
  @ApiCreatedResponse({
      status: HttpStatus.CREATED,
      description: 'Wallets fetched successfully',
      type: WalletsResponseDto
  })
  async findAll(@Query() query: { currency: string }, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const wallets = await this.walletService.findAll(user.id, query.currency);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Wallets fetched',
      data: { wallets },
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Get(':id')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'fetch a wallet'
  })
  @ApiCreatedResponse({
      status: HttpStatus.CREATED,
      description: 'Wallets fetched successfully',
      type: WalletsResponseDto
  })
  async findOne(@Param() param: WalletQueryDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const wallet = await this.walletService.findOne(user.id, param.id);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Wallet fetched',
      data: wallet,
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Post('fund')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'fund a wallet'
  })
  @ApiCreatedResponse({
      status: HttpStatus.OK,
      description: 'Wallet funded successfully',
      type: WalletResponseDto
  })
  async fund(@Body() fundWalletDto: FundWalletDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const fundedWallet = await this.walletService.fund({ ... fundWalletDto, owner: user.id as string });

    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'Wallet funded successfully',
      data: { wallet: fundedWallet },
    }); 
  }
}
