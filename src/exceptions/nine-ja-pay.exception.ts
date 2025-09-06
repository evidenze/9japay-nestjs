import { HttpException, HttpStatus } from '@nestjs/common';
import { _9JaPayResponse } from '../interfaces';

export class NineJaPayException extends HttpException {
  public readonly nineJaPayStatusCode: string;
  public readonly nineJaPayResponse: _9JaPayResponse;

  constructor(
    nineJaPayStatusCode: string,
    response: _9JaPayResponse,
    httpStatusCode?: number
  ) {
    // Map 9jaPay status codes to appropriate HTTP status codes
    const httpStatus = httpStatusCode || NineJaPayException.mapToHttpStatus(nineJaPayStatusCode);
    
    super(
      {
        statusCode: httpStatus,
        message: response.message,
        nineJaPayStatusCode,
        nineJaPayResponse: response,
      },
      httpStatus
    );

    this.nineJaPayStatusCode = nineJaPayStatusCode;
    this.nineJaPayResponse = response;
  }

  private static mapToHttpStatus(nineJaPayStatusCode: string): number {
    switch (nineJaPayStatusCode) {
      case '00': // Success
        return HttpStatus.OK;
      case '01': // Processing
        return HttpStatus.ACCEPTED;
      case '06': // General error
        return HttpStatus.INTERNAL_SERVER_ERROR;
      case '09': // Validation error
        return HttpStatus.BAD_REQUEST;
      case '25': // No record found
        return HttpStatus.NOT_FOUND;
      case '26': // Duplicate record
        return HttpStatus.CONFLICT;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
