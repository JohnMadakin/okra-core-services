import { Logger as NestLogger } from '@nestjs/common';

export class Logger {
  private logger: NestLogger = new NestLogger();

  info(message: string, context?: string): void {
    this.logger.log(message, context);
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, context);
  }

  error(message: string, context?: string): void {
    this.logger.error(message, context);
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, context);
  }
}
