
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '@nestjs/common';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class RestTrackingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(RestTrackingMiddleware.name);
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const uuid = uuidv4();
    res.on('finish', () => {
      const elapsed = Date.now() - start;
      if(res.statusCode >= 400) {
        this.logger.error(`[${uuid}] ${req.method} ${req.url} ${res.statusCode} ${elapsed}ms`);
      }else{
        this.logger.log(`[${uuid}] ${req.method} ${req.url} ${res.statusCode} ${elapsed}ms`);
      }
    });
    res.on('error', (err) => {
      const elapsed = Date.now() - start;
      this.logger.error(`${req.method} ${req.url} ${res.statusCode} ${elapsed}ms ${uuid} - Error: ${err.message}`);
    });
    next();
  }
}