import { HttpException, HttpStatus } from '@nestjs/common';

export class MailServerException extends HttpException {
    constructor(error: string) {
      super(`Mail server returend an error ${error} `, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }