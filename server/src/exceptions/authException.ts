import { HttpException } from './httpException';
import { EXCEPTION_CODE } from 'src/enums/exceptionCode';
export class AuthenticationException extends HttpException {
  constructor(
    public readonly message: string,
    public readonly data?: any,
  ) {
    super(message, EXCEPTION_CODE.AUTHENTICATION_FAILED, data);
  }
}
