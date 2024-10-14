import axios from 'axios';
import { Logger } from 'src/logger';

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

  constructor(private readonly logger: Logger,options: PassportConfig) {
    this.logger = logger
    this.options = options;
  }
  public getAuthUrl(): string {
    const jumpUrl = encodeURIComponent(`http://${window.location.host}/passport/redirect?jumpTo=` + window.location.href)

    const url = `${this.options.passportUrl}?appid=${this.options.appId}&role=${this.options.role}&source=${
      this.options.source
    }&redirectUrl=${jumpUrl}`
    return url
  }
  public async getUserInfo(ticket: string): Promise<UserInfo> {
    const param = {
      ticket,
      returncell: 1,
      caller_id: 'daijia-nodejs-biz-cms_question',
    }
    const qjson = JSON.stringify(param)
    this.logger.info('qjson' + qjson)
    let data
  
    try {
      const params = new FormData()
      params.append('ticket', ticket)
      params.append('caller_id', 'daijia-nodejs-biz-cms_question')
      const q = `q=${qjson}`
      this.logger.info('getUserInfo params:' + JSON.stringify(params))
      data = await axios({
        method: 'post',
        url: this.options.validUrl,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: q,
      })
      
    } catch (error) {
      this.logger.info('getUserInfo error:' + JSON.stringify(error))
      return 
    }
    this.logger.info('getUserInfo data:' + JSON.stringify(data.data))
  
    if (!data || data.data.errno) {
      return data.data
    }
  
    return data.data
  }
}
