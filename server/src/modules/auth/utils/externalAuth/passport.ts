import axios from 'axios';

export interface PassportConfig {
  passportUrl:string
  appId: string;
  role: string;
  source: string;
  validUrl: string;
}

export interface UserInfo {
  uid: number;
  cell: string;
}


export class ExternalAuthPassport {
  private readonly options!: PassportConfig;

  constructor(options: PassportConfig) {
    this.options = options;
  }
  public getAuthUrl(): string {
    const jumpUrl = encodeURIComponent(`http://${window.location.host}/passport/redirect?jumpTo=` + window.location.href)

    const url = `${this.options.passportUrl}?appid=${this.options.appId}&role=${this.options.role}&source=${
      this.options.source
    }&redirectUrl=${jumpUrl}`
    return 
  }
  public async getUserInfo(ticket: string): Promise<UserInfo> {
    const param = {
      ticket,
      returncell: 1,
      caller_id: 'daijia-nodejs-biz-cms_question',
    }
    const qjson = JSON.stringify(param)
    let data
  
    try {
      const params = new FormData()
      params.append('ticket', ticket)
      params.append('caller_id', 'daijia-nodejs-biz-cms_question')
      const q = `q=${qjson}`
      data = await axios({
        method: 'post',
        url: this.options.validUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: q,
      })
    } catch (error) {
      return 
    }
  
    if (!data || data.data.errno) {
      return 
    }
  
    return data.data
  }
}
