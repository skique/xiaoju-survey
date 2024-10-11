import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthenticationException } from '../exceptions/authException';
import { AuthService } from 'src/modules/auth/services/auth.service';
import { ExternalAuthService } from 'src/modules/auth/services/externalAuth.service';

@Injectable()
export class Authentication implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly externalAuthService: ExternalAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const loginUrl = '/management/login';
    // 跳转第三方的登录页面
    // const loginUrl = await this.externalAuthService.generateAuthUrl({
    //   kind: '',
    //   state: '',
    // });
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new AuthenticationException('请登录', { loginUrl });
    }

    try {
      const user = await this.authService.verifyToken(token);
      request.user = user;
      return true;
    } catch (error) {
      throw new AuthenticationException(error?.message || '用户凭证错误', {
        loginUrl,
      });
    }
  }
}
