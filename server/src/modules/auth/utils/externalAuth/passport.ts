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
    
    let data
  
    try {
      const q = `q=${qjson}`
      this.logger.info('q:' + q)
      const axiosoptions = {
        method: 'post',
        url: this.options.validUrl,
        data: q,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
      this.logger.info('axiosoptions:' + JSON.stringify(axiosoptions))
      // const data = await axios.post(this.options.validUrl, q)

      const instance = axios.create();
      instance.interceptors.request.use((config) =>{
        this.logger.info('request:' + JSON.stringify(config))
        // 在发送请求之前做些什么
        return config;
      }, (error) => {
        this.logger.info('request error:' + JSON.stringify(error.message))
        // 对请求错误做些什么
        return Promise.reject(error);
      });
      instance.interceptors.response.use( (response) => {
        this.logger.info('response:' + JSON.stringify(response.data))
        // 2xx 范围内的状态码都会触发该函数。
        // 对响应数据做点什么
        return response;
      },  (error) => {
        // 超出 2xx 范围的状态码都会触发该函数。
        // 对响应错误做点什么
        this.logger.info('response error:' + JSON.stringify(error.message))
        return Promise.reject(error);
      });
      data = await instance(axiosoptions)
      this.logger.info('data:' + data)
    } catch (error) {
      this.logger.error('getUserInfo error:' + JSON.stringify(error.message))
      return 
    }
    this.logger.info('getUserInfo data:' + JSON.stringify(data.data))
  
    if (!data || data.data.errno) {
      return data.data
    }
  
    return data.data
  }
}
