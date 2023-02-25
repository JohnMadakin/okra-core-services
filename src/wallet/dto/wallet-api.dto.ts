import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/api-dtos/api-response.dto";
import { WalletDto } from "./wallet.dto";


export class WalletResponseData {
	@ApiProperty()
	wallet: WalletDto;
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