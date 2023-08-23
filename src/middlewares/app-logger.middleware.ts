import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { HttpStatus } from '@nestjs/common/enums';

import { Request, Response, NextFunction } from 'express';

@Injectable()
export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  /**
   * Logs all the incomming requests
   */
  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get('user-agent') || '';
    response.on('close', () => {
      const { statusCode } = response;
      const contentLength = response.get('content-length');

      const message = `${method} '${originalUrl}' ${statusCode} CONTENT-LENGTH=${contentLength}, USER-AGENT=${userAgent},IP= ${ip}`;
      if (statusCode < HttpStatus.BAD_REQUEST) this.logger.log(message);
      else if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR)
        this.logger.error(message);
      else this.logger.warn(message);
    });

    next();
  }
}
