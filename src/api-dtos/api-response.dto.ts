import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  status: string;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data: T;

  constructor(status: string, message: string, data: T) {
    this.status = status;
    this.message = message;
    this.data = data;
  }
}
