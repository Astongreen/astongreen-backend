import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Messages } from '../constants/messages';

@Injectable()
export class ErrorInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError((err) => {
        console.log(err);
        if (err instanceof HttpException) {
          const status = err.getStatus();
          const response = err.getResponse() as any;
          const message =
            (typeof response === 'object' && (response.message || response.error)) ||
            err.message ||
            Messages.GENERIC.FAILURE;
          const errorBody = {
            success: false,
            message,
            error: typeof response === 'object' ? response : undefined,
            statusCode: status,
          };
          return throwError(() => new HttpException(errorBody, status));
        }
        const errorBody = {
          success: false,
          message: err.message || Messages.GENERIC.FAILURE,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        };
        console.log('errorBody', errorBody);
        return throwError(() => new HttpException(errorBody, HttpStatus.INTERNAL_SERVER_ERROR));
      }),
    );
  }
}


