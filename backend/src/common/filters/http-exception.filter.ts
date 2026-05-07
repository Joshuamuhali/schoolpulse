import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@/common/interceptors/transform.interceptor';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      message = typeof exceptionResponse === 'string' 
        ? exceptionResponse 
        : (exceptionResponse as any).message || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Internal server error';
    }

    const errorResponse: ApiResponse<null> = {
      success: false,
      data: null,
      error: message,
    };

    // Log error
    console.error(`[${new Date().toISOString()}] ${request.method} ${request.url} - ${status}: ${message}`);
    if (exception instanceof Error) {
      console.error(exception.stack);
    }

    response.status(status).json(errorResponse);
  }
}
