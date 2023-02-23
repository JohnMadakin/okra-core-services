import { Catch, ExceptionFilter, HttpException, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger();

  private handleHttp(exception: HttpException, path: String,  response: Response) {
    const status = exception.getStatus();
    const errObject = exception.getResponse();
    const err = [];

    if(Array.isArray(errObject)) {
      
      for(const e of errObject) {
        err.push({
          name: e['error'],
          message: e['message']
        });
      }
    } else if(typeof errObject === 'object'){
      err.push({
        name: exception.name,
        message: errObject['message'],
      });
    } else {
      err.push({
        name: exception.name,
        message: errObject,
      });
    }

    response.status(status).json({
      status: 'error',
      success: false,
      code: status,
      errors: err,
      timestamp: new Date().toISOString(),
      path,
    });
  }

  catch(error: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    this.logger.error(error);

    if (error instanceof HttpException) {
      return this.handleHttp(error, request.url, response);
    } else {
      response.status(500).json({
        status: 'error',
        success: false,
        code: 500,
        message: 'An error occured',
        errors: error['errors'] ? error['errors'] : error,
        timestamp: new Date().toISOString(),
        path: request.url,
      });
    }
  }
}

