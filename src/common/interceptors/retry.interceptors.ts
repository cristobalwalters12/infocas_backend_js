import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

@Injectable()
export class RetryInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isAuthRoute = context
      .switchToHttp()
      .getRequest()
      .url.includes('/usuario/login');
    if (isAuthRoute) {
      return next.handle().pipe(
        retry({
          count: 1,
          delay: 1000,
        }),
      );
    } else {
      return next.handle().pipe(
        retry({
          count: 5,
          delay: 3000,
        }),
        catchError((err) => {
          return throwError(() => err);
        }),
      );
    }
  }
}
