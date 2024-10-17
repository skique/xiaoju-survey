import { SecurityPlugin } from '../interface';
import { SurveyResponse } from 'src/models/surveyResponse.entity';
import { decryptData, encryptData, isDataSensitive, maskData } from './utils';
import { cleanRichText } from 'src/utils/string';
import { get, set } from 'lodash';
import DataSecSDK, { AnalyzeClazzV2Request } from './DataSecSDK'

export class ResponseSecurityPlugin implements SecurityPlugin {
  constructor(
    private readonly secretKey: string, 
    private dataSecurityEndpoint: string,
    private dataSecurityAppId: string,
    private dataSecuritySecretKey: string,
  ) {
  }
  async encryptResponseData({responseData, dataList = []}) {
    const secretKeys = await this.getSensitiveKeys(responseData, dataList)
    if (responseData.data) {
      for (const key in responseData.data) {
        const value = responseData.data[key];
        if (secretKeys.includes(`data.${key}`)) {
          responseData.data[key] = Array.isArray(value)
            ? value.map((item) =>
                encryptData(item, {
                  secretKey: this.secretKey,
                }),
              )
            : encryptData(value, {
                secretKey: this.secretKey,
              });
        }
      }
    }
    responseData.secretKeys = secretKeys;
    return responseData
  }

  decryptResponseData(responseData: SurveyResponse) {
    const secretKeys = responseData.secretKeys;
    if (Array.isArray(secretKeys) && secretKeys.length > 0) {
      for (let key of secretKeys) {
        if (key.split('data.').length) {
          key = key.split('data.')[1] 
        }
        if (Array.isArray(responseData.data[key])) {
          responseData.data[key] = responseData.data[key].map((item) =>
            decryptData(item, { secretKey: this.secretKey }),
          );
        } else {
          responseData.data[key] = decryptData(responseData.data[key], {
            secretKey: this.secretKey,
          });
        }
      }
    }
    responseData.secretKeys = [];
  }

  maskData(data: Record<string, any>) {
    Object.keys(data).forEach((key) => {
      if (isDataSensitive(data[key])) {
        data[key] = maskData(data[key]);
      }
    });
  }
  async getSensitiveKeys(params, dataList) {
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
  extractSensitiveKeys = (response) => {
    if (response.code === 0) {
      return response.data
        .filter((item) => item.cntDriven && item.mainClassification?.category)
        .map((item) => {
          return item.fieldName
        });
    }
  
    throw response;
  }
  
  prepareQuestionTitles(dataList) {
    return dataList.reduce((acc, item) => {
      if (item.field) {
        acc[item.field] = item.title;
      }
      return acc;
    }, {});
  }
}
