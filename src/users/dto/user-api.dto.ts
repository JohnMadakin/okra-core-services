import { ApiProperty } from "@nestjs/swagger";
import { ApiResponseDto } from "src/api-dtos/api-response.dto";
import { UserDto } from "./user.dto";


export class UserResponseData {
	@ApiProperty()
	user: UserDto;
}

export class UserResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: UserResponseData;
}

export class UsersResponseData {
	@ApiProperty({ /* isArray: true */ })
	data: UserDto[];
}

export class UsersResponseDto extends ApiResponseDto {
	@ApiProperty()
	data: UsersResponseData;
}