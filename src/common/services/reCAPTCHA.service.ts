import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import * as qs from 'qs'; // 📌 Necesario para formatear el body correctamente

@Injectable()
export class TurnstileService {
  private secretKey = '0x4AAAAAAA_dZEz8O-ahcCZ11BKjxe3c0iA';

  constructor(private readonly httpService: HttpService) {}

  async validateToken(token: string, userIp?: string): Promise<boolean> {
    const url = `https://challenges.cloudflare.com/turnstile/v0/siteverify`;

    try {
      console.log('Token recibido para validación:', token);

      const response$ = this.httpService
        .post(
          url,
          qs.stringify({
            // 📌 Enviamos los datos en el `body` correctamente
            secret: this.secretKey,
            response: token,
            remoteip: userIp || '0.0.0.0', // 📌 Cloudflare recomienda incluir la IP
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          },
        )
        .pipe(map((res) => res.data));

      const data = await lastValueFrom(response$);
      console.log('Respuesta de Turnstile:', JSON.stringify(data, null, 2));

      if (!data.success) {
        throw new HttpException(
          `Turnstile no válido: ${JSON.stringify(data['error-codes'])}`,
          HttpStatus.FORBIDDEN,
        );
      }

      return true;
    } catch (error) {
      console.error('Error en la validación de Turnstile:', error);
      throw new HttpException(
        'Error al validar Turnstile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
