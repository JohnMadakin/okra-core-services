import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "../../api-dtos/api-response.dto";
import { WalletDto, FundWalletDto } from "../../wallet/dto/wallet.dto";


export class WalletResponseData {
	@ApiProperty()
	wallet: WalletDto;
}

export class FundWalletResponseData {
	@ApiProperty()
	wallet: FundWalletDto;
}

export class FundWalletResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: FundWalletResponseData;
}
export class WalletResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: WalletResponseData;
}

export class WalletsResponseData {
	@ApiProperty({})
	data: WalletDto[];
}

export class WalletsResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: WalletsResponseData;
}