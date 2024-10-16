import crypto from 'crypto';
import fetch from './fetch';

export interface AnalyzeClazzV2Request {
  ruleSet: 'DEFAULT' | 'MULTI_STRATEGY_STRUCTURE' | 'PII';
  simplifySamples: boolean;
  fields: {
    name: string;
    comment: string;
    type: string;
  }[];
  samples: any[];
}

export interface AnalyzeClazzV2Response {
  code: number;
  msg: string;
  data: {
    fieldName: string;
    cntDriven: boolean;
    mainClassification: { name: string; level: string; value: number; category: number };
    classifications: { name: string; level: string; value: number; category: number }[];
  }[];
}

export class DataSecSDK {
  private endpoint: string;
  private config: {
    appId: string;
    secretKey: string;
  };

  constructor(params: {
    endpoint: string;
    config: {
      appId: string;
      secretKey: string;
    };
  }) {
    this.endpoint = params.endpoint;
    this.config = params.config;
  }

  private signature() {
    const ts = new Date().getTime();
    const signStringify = [this.config.appId, this.config.secretKey, ts].join(':');

    const sign = crypto.createHash('md5').update(signStringify).digest('hex');
    return {
      ts,
      sign,
    };
  }

  private post<T>(uri: string, body: T | object) {
    const url = `${this.endpoint}/${uri.startsWith('/') ? uri.slice(1) : uri}`;
    return fetch(url, {
      method: 'POST',
      body: body,
      headers: {
        app_id: this.config.appId,
        ...this.signature(),
      },
    });
  }

  clazzV2(body: AnalyzeClazzV2Request) {
    return this.post('/analyze/clazz/v2', body) as Promise<AnalyzeClazzV2Response>;
  }
}

export default DataSecSDK;
