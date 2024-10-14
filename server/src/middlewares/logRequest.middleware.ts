import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { Logger } from '../logger/index'; // 替换为你实际的logger路径
import { genTraceId } from '../logger/util';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  constructor(private readonly logger: Logger) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, baseUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now();
    const traceId = genTraceId({ ip });
    req['traceId'] = traceId;
    const query = JSON.stringify(req.query);
    const body = JSON.stringify(req.body);
    this.logger.info(
      `method=${method}||uri=${baseUrl}||ip=${ip}||ua=${userAgent}||query=${query}||body=${body}`,
      {
        dltag: '_com_request_in',
      },
    );

    res.once('finish', () => {
      const duration = Date.now() - startTime;
      const { method, path, ip } = req;
      this.logger.info(
        `method=${method}||uri=${path}||status=${res.statusCode.toString()}||proc_time=${duration}ms`,
        {
          dltag: '_com_request_out',
        },
      );
    });

    next();
  }
}
