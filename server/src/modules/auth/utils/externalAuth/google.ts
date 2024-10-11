import { google } from 'googleapis';
import { Credentials } from 'google-auth-library';

export interface GoogleAuthOptions {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  state?: string;
}

export interface UserInfo {
  openid: string;
  user: {
    email?: string;
    name: string;
    avatar: string;
    lang?: string;
  };
}

export class ExternalAuthGoogle {
  private readonly options!: GoogleAuthOptions;

  constructor(options: GoogleAuthOptions) {
    this.options = options;
  }

  public getAuthUrl(): string {
    const oauth2Client = this.getOauth2Client();
    return oauth2Client.generateAuthUrl({
      scope: ['openid', 'profile', 'email'],
      redirect_uri: this.options.redirectUrl,
      state: this.options.state,
    });
  }

  public async getToken(code: string): Promise<Credentials> {
    const oauth2Client = this.getOauth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  public async getUserInfo(tokens: Credentials): Promise<UserInfo> {
    const oauth2Client = this.getOauth2Client();
    oauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: oauth2Client,
      version: 'v2',
    });
    const result = await oauth2.userinfo.get();

    if (!result.data) {
      throw new Error('获取用户失败');
    }

    const userInfo = result.data as any;

    return {
      openid: userInfo.id,
      user: {
        email: userInfo.email.toLowerCase(),
        lang: userInfo.locale,
        name: `${userInfo.family_name}${userInfo.given_name}`,
        avatar: userInfo.picture,
      },
    };
  }

  private getOauth2Client() {
    return new google.auth.OAuth2(
      this.options.clientId,
      this.options.clientSecret,
      this.options.redirectUrl,
    );
  }
}
