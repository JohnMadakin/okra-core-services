import { ApiProperty } from '@nestjs/swagger';

export class ApiErrorResponseDto {
  @ApiProperty()
  statusCode: number;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error: string;

  constructor(statusCode: number, message: string, error?: string) {
    this.statusCode = statusCode;
    this.message = message;
    this.error = error || 'Internal Server Error';
  }
}
