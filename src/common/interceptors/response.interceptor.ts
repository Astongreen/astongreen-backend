import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { Messages } from '../constants/messages';

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, any> {
    constructor(private readonly reflector: Reflector) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const handler = context.getHandler();
        const customMessage = this.reflector.get<string>(RESPONSE_MESSAGE_KEY, handler);
        const message = customMessage || Messages.GENERIC.SUCCESS;
        return next.handle().pipe(
            map((data: any) => ({
                success: true,
                message,
                data,
            })),
        );
    }
}


