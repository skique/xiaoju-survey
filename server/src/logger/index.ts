import * as log4js from 'log4js';
import moment from 'moment';
import { Injectable, Scope, Inject } from '@nestjs/common';
import { CONTEXT, RequestContext } from '@nestjs/microservices';

const log4jsLogger = log4js.getLogger();

@Injectable({ scope: Scope.REQUEST })
export class Logger {
  private static inited = false;

  constructor(@Inject(CONTEXT) private readonly ctx: RequestContext) {}

  static init(config: { filename: string }) {
    if (Logger.inited) {
      return;
    }
    log4js.configure({
      appenders: {
        app: {
          type: 'dateFile',
          filename: config.filename || './logs/app.log',
          pattern: 'yyyy-MM-dd',
          alwaysIncludePattern: true,
          numBackups: 7,
          layout: {
            type: 'pattern',
            pattern: '%m',
          },
        },
      },
      categories: {
        default: { appenders: ['app'], level: 'trace' },
      },
    });
    Logger.inited = true;
  }
  getStackInfo(deep) {
    const stackList = (new Error()).stack.split('\n').slice(deep + 1);
    const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
    const stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
  
    const s = stackList[0];
    const sp = stackReg.exec(s) || stackReg2.exec(s);
  
    if (sp && sp.length === 5) {
      return { method: sp[1], file: sp[2], line: sp[3], pos: sp[4], stack: stackList.join('\n') };
    }
    return null;
  }
  _log(message, options: { dltag?: string; level: string }) {
    const datetime = moment().format('YYYY-MM-DD HH:mm:ss.SSS');
    const level = options?.level;
    const stackInfo = this.getStackInfo(2);  //
    const dltag = options?.dltag ? `${options.dltag}||` : '_undef';
    const traceIdStr = this.ctx?.['traceId']
      ? `traceid=${this.ctx?.['traceId']}||`
      : '';
    return log4jsLogger[level](
      `[${level.toUpperCase()}][${datetime}][${stackInfo.file}:${stackInfo.line}] ${dltag}${traceIdStr}${message}`,
    );
  }

  info(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'info' });
  }
  warning(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'warning' });
  }
  trace(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'trace' });
  }
  debug(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'debug' });
  }

  error(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'error' });
  }
  fatal(message, options?: { dltag?: string }) {
    return this._log(message, { ...options, level: 'fatal' });
  }
}
