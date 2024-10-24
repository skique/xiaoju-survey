import { SecurityPlugin } from '../interface';
import { SurveyResponse } from 'src/models/surveyResponse.entity';
import { isDataSensitive, maskData, isString } from './utils';
import { cleanRichText } from 'src/utils/string';
import { get, set } from 'lodash';
import DataSecSDK, { AnalyzeClazzV2Request } from './DataSecSDK'
import * as kms from '@didi/kms-exts'


export class ResponseSecurityPlugin implements SecurityPlugin {
  constructor(
    private dataSecurityEndpoint: string,
    private dataSecurityAppId: string,
    private dataSecuritySecretKey: string,
    private kmsAk: string,
    private kmsSk: string,
    private kmsSecretId: string,
    private kmsVersionId: string,
  ) {
  }
  async encryptResponseData({responseData, dataList = [], logger}) {
    const secretKeys = await this.getSensitiveKeys(responseData, dataList)
    logger.info(`encryptData-secretKeys: ${secretKeys}`);
    if (responseData.data) {
      for (const key in responseData.data) {
        const value = responseData.data[key];
        if (secretKeys.includes(`data.${key}`)) {
          responseData.data[key] = Array.isArray(value)
            ? value.map((item) =>
                this.encryptData(item),
              )
            : this.encryptData(value);
          logger.info(`encryptData-${key}: ${responseData.data[key]}`);
        }
      }
    }
    responseData.secretKeys = secretKeys;
    return responseData
  }

  public decryptResponseData(responseData: SurveyResponse, logger) {
    const secretKeys = responseData.secretKeys;
    // logger.info(`decryptData-responseData: ${responseData}`); 
    // logger.info(`decryptData-secretKeys: ${secretKeys}`); 
    if (Array.isArray(secretKeys) && secretKeys.length > 0) {
      for (let key of secretKeys) {
        if (key.split('data.').length) {
          key = key.split('data.')[1] 
        }
        if (Array.isArray(responseData.data[key])) {
          responseData.data[key] = responseData.data[key].map((item) =>
            this.decryptData(item),
          );
        } else {
          responseData.data[key] = this.decryptData(responseData.data[key]);
          // logger.info(`decryptData-${key}: ${responseData.data[key]}`);
        }
      }
    }
    responseData.secretKeys = [];
  }

  public maskData(data: Record<string, any>) {
    Object.keys(data).forEach((key) => {
      if (isDataSensitive(data[key])) {
        data[key] = maskData(data[key]);
      }
    });
  }
  private async getSensitiveKeys(params, dataList) {
    const fields = [];
    const titlesMap = this.prepareQuestionTitles(dataList)
    const ignoreKeys = ['optionsWithId', 'scores', 'score', 'p', 'channel', 'total', 'difTime', 'mapLocation', 'secret']
    Object.entries(params.data).forEach(([key, value]) => {
      if (ignoreKeys.includes(key)) {
        return
      }
      // 构造题目的送审数据
      fields.push({
        name: `data.${key}`,
        comment: cleanRichText(titlesMap[key]),
        type: Array.isArray(value) ? 'Array' : 'String',
        value,
      });
    });
    const samples = fields
      .map((item) => item.name)
      .map((key) => get(params, key))

    const payload: AnalyzeClazzV2Request = {
      // ruleSet: 'PII',
      ruleSet: 'MULTI_STRATEGY_STRUCTURE',
      simplifySamples: true,
      fields: fields.map(({ name, comment, type }) => ({ name, comment, type })),
      samples: [samples],
    };
    const dataSecSDK = new DataSecSDK({
      endpoint: this.dataSecurityEndpoint,
      config: {
        appId: this.dataSecurityAppId,
        secretKey: this.dataSecuritySecretKey
      },
    })
    const ret = await dataSecSDK.clazzV2(payload)
    const sensitiveKeys = this.extractSensitiveKeys(ret);
    
    return sensitiveKeys
    
  }
  private extractSensitiveKeys = (response) => {
    if (response.code === 0) {
      return response.data
        .filter((item) => item.cntDriven && item.mainClassification?.category)
        .map((item) => {
          return item.fieldName
        });
    }
  
    throw response;
  }
  private prepareQuestionTitles(dataList) {
    return dataList.reduce((acc, item) => {
      if (item.field) {
        acc[item.field] = item.title;
      }
      return acc;
    }, {});
  }
  encryptData = (data) => {
    if (!isString(data)) {
      return data;
    }
    try {
      const secret = kms.aesEncrypt(this.kmsAk, this.kmsSk, this.kmsSecretId, this.kmsVersionId, kms.CBC, data, 0)
      if (secret) {
        // this.logger.info('ResponseSecurityPlugin-encryptData-secret: %s:'+secret)
        return secret
      }
      // this.logger.error('ResponseSecurityPlugin-encryptData-error: %j'+JSON.stringify({
      //     params: data,
      //     result: secret,
      //     msg: '加密失败',
      //   })
      // )
      return data
    } catch (e) {
      // this.logger.error('ResponseSecurityPlugin-encryptData-error: %j' + JSON.stringify({
      //     params: data,
      //     error: e,
      //     msg: 'kms 初始化失败',
      //   })
      // )
      return data
    }
  };
  
  decryptData = (data) => {
    if (!isString(data)) {
      return data;
    }
    try {
      const secret = kms.aesDecrypt(this.kmsAk, this.kmsSk, kms.CBC, data)
      if (secret) {
        // this.logger.info('ResponseSecurityPlugin-decryptData-secret: %s:'+secret)
        return secret
      }
      // this.logger.error('ResponseSecurityPlugin-service-aesDecrypt-error: %j'+JSON.stringify({
      //     params: data,
      //     result: secret,
      //     msg: '解密失败',
      //   })
      // )
      return data
    } catch (e) {
      // this.logger.error('ResponseSecurityPlugin-aesEncrypt-error: %j'+JSON.stringify({
      //     params: data,
      //     error: e,
      //     msg: 'kms 初始化失败',
      //   })
      // )
      return data
    }
  };
}
