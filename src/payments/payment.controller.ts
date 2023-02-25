import { Body, Controller, Get, HttpStatus, Param, Post, Query, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiCreatedResponse, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { CurrentUser } from '../users/current-user.decorator';
import { PrincipalGuard } from 'src/auth/principal.guard';
import { NormalizedUser } from 'src/global/types';
import { PaymentService } from './payment.service';
import { PaymentResponseDto, PaymentsResponseDto } from './dto/payment-api.dto';
import { IntiatePaymentDto, IntiateRefundDto, PaymentParamsDto, PaymentQueryDto, VerifyPaymentQueryDto } from './dto/payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}
 
  @UseGuards(PrincipalGuard)
  @Post('initiate')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'initiate a payment'
  })
  @ApiCreatedResponse({
      status: HttpStatus.CREATED,
      description: 'Payment initiated successfully',
      type: PaymentResponseDto
  })
  async initiate(@Body() initiatePaymentDto: IntiatePaymentDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const initiatedPayment = await this.paymentService.initiate({ ...initiatePaymentDto, owner: user.id as string });

    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'Payment initiated successfully',
      data: { payment: initiatedPayment },
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Get('')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'fetch all payment'
  })
  @ApiCreatedResponse({
      status: HttpStatus.OK,
      description: 'Payments fetched successfully',
      type: PaymentsResponseDto
  })
  async findAll(@Query() query: PaymentQueryDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const wallet = await this.paymentService.findAll(user.id as string, query.nextCursor, query.previousCursor, query.limit);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Wallet fetched',
      data: wallet,
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Post('refund')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'refund a payment'
  })
  @ApiCreatedResponse({
      status: HttpStatus.CREATED,
      description: 'Payment initiated successfully',
      type: PaymentResponseDto
  })
  async refund(@Body() initiateRefund: IntiateRefundDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const initiatedRefund = await this.paymentService.refund(initiateRefund.amount, user.id as string, initiateRefund.payment);

    return res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'Refund initiated successfully',
      data: initiatedRefund,
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Get('verify')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'verify a payment'
  })
  @ApiCreatedResponse({
      status: HttpStatus.OK,
      description: 'Payment verified',
      type: PaymentResponseDto
  })
  async verifyEntity(@Query() query: VerifyPaymentQueryDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    console.log('🏀');
    const result = await this.paymentService.verify(query, user.id as string);
    const data = query.paymentId ? { payments: result } : { refunds: result };
    const message = query.paymentId ? 'Payments verified' : 'Refunds verified';
    return res.status(HttpStatus.OK).json({
      status: 'success',
      message,
      data,
    }); 
  }

  @UseGuards(PrincipalGuard)
  @Get(':id')
  @UsePipes(ValidationPipe)
  @ApiOperation({
      summary: 'fetch a payment'
  })
  @ApiCreatedResponse({
      status: HttpStatus.OK,
      description: 'Payment fetched successfully',
      type: PaymentResponseDto
  })
  async findOne(@Param() param: PaymentParamsDto, @CurrentUser() user: NormalizedUser, @Res() res: Response ) {
    const wallet = await this.paymentService.findById(param.id, user.id as string);

    return res.status(HttpStatus.OK).json({
      status: 'success',
      message: 'Wallet fetched',
      data: wallet,
    }); 
  }

}
