import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../api-dtos/api-response.dto";
import { PaymentDto, IntiatePaymentDto } from "../../payments/dto/payment.dto";


export class PaymentResponseData {
	@ApiProperty()
	payment: PaymentDto;
}

export class InitiatePaymentResponseData {
	@ApiProperty()
	payment: IntiatePaymentDto;
}

export class InitiatePaymentResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: InitiatePaymentResponseData;
}
export class PaymentResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: PaymentResponseData;
}

export class PaymentsResponseData {
	@ApiProperty({})
	data: PaymentDto[];
}

export class PaymentsResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: PaymentsResponseData;
}