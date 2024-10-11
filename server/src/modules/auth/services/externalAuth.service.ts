import { Injectable } from '@nestjs/common';

import { EXTERNAL_LOGIN_KIND_ENUM } from 'src/enums/externalAuth';
import { ExternalAuthGoogle } from '../utils/externalAuth/google';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExternalAuthService {
  constructor(private readonly configService: ConfigService) {}

  async generateAuthUrl({
    kind,
    state,
  }: {
    kind: EXTERNAL_LOGIN_KIND_ENUM;
    state: string;
  }) {
    switch (kind) {
      case EXTERNAL_LOGIN_KIND_ENUM.GOOGLE: {
        const google = new ExternalAuthGoogle({
          clientId: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_ID',
          ),
          clientSecret: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_SECRET',
          ),
          redirectUrl: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_REDIRECT_URL',
          ),
          state,
        });
        return google.getAuthUrl();
      }
      default: {
        throw new Error('未知的类型');
      }
    }
  }

  getTicketByCode({
    kind,
    code,
  }: {
    kind: EXTERNAL_LOGIN_KIND_ENUM;
    code: string;
  }) {
    switch (kind) {
      case EXTERNAL_LOGIN_KIND_ENUM.GOOGLE: {
        const google = new ExternalAuthGoogle({
          clientId: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_ID',
          ),
          clientSecret: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_SECRET',
          ),
          redirectUrl: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_REDIRECT_URL',
          ),
        });
        return google.getToken(code);
      }
      default: {
        throw new Error('未知的类型');
      }
    }
  }

  getUserInfoByTicket({ kind, ticket }) {
    switch (kind) {
      case EXTERNAL_LOGIN_KIND_ENUM.GOOGLE: {
        const google = new ExternalAuthGoogle({
          clientId: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_ID',
          ),
          clientSecret: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_CLIENT_SECRET',
          ),
          redirectUrl: this.configService.get<string>(
            'XIAOJU_SURVEY_GOOGLE_REDIRECT_URL',
          ),
        });
        return google.getUserInfo(ticket);
      }
      default: {
        throw new Error('未知的类型');
      }
    }
  }
}
