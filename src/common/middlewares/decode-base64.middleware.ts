import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DecodeBase64Middleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body.correo) {
      req.body.correo = Buffer.from(req.body.correo, 'base64').toString(
        'utf-8',
      );
    }
    if (req.body.contraseña) {
      req.body.contraseña = Buffer.from(req.body.contraseña, 'base64').toString(
        'utf-8',
      );
    }
    next();
  }
}
