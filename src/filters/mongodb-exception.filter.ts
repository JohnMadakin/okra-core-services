import { Catch, ExceptionFilter, HttpException, ArgumentsHost } from '@nestjs/common';
import { Request, Response } from 'express';
import { MongoError } from 'mongodb';
import { ApiErrorResponseDto } from '../dto/api-error-response.dto';
import { Logger } from '../logger';

@Catch(MongoError)
export class MongoExceptionFilter implements ExceptionFilter {
  catch(exception: MongoError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (exception.code === 11000) {
      statusCode = 400;
      message = 'Duplicate key error';
    }

    const errorResponse = new ApiErrorResponseDto(statusCode, message);
    const logger = new Logger();
    logger.error(`[${request.method}] ${request.url} - ${message}`);

    response.status(statusCode).json(errorResponse);
  }
}
