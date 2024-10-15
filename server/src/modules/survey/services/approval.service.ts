import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Approval } from 'src/models/approval.entity';
import { ObjectId } from 'mongodb';
import { APPROVAL_STATUS } from 'src/enums/index';
import { ApprovalPlugin } from 'src/modules/survey/utils/approval';
import { fillUrl } from 'src/utils/string'
import { ConfigService } from '@nestjs/config';
import * as _ from 'lodash'
import fetch from 'node-fetch';
@Injectable()
export class ApprovalService {
  constructor(
    @InjectRepository(Approval)
    private readonly approvalRepository: MongoRepository<Approval>,
    // private readonly logger: Logger,
    private readonly configService: ConfigService
  ) {}
  instantiation({surveyConf, surveyMeta}) {
    return new ApprovalPlugin({surveyConf, surveyMeta})
  }

  async start(surveyId, userId, auditInfo): Promise<any> {
    const { imgUrls, content, videoUrls, title, auditId } = auditInfo
    // const defaultBannerImgs = this._getDefaultBannerImgs()
    // const filterImgUrls = imgUrls.filter(img => !defaultBannerImgs.includes(img))
    const filterImgUrls = imgUrls

    const result: any = await this.sendApproval({
      content,
      imgUrls: filterImgUrls.map(fillUrl),
      videoUrls: videoUrls.map(fillUrl),
      bizData: {
        surveyId,
        auditId,
        owner: userId,
        info: {
          title,
        },
      },
      previewUrl: ``,
    })

    const keys = _.get(result, 'keys', [])
    const keyObj = {}
    for (const key of keys) {
      keyObj[key.label] = key.keyword.split(',')
    }
    result.keys = keyObj
    result.hasImg = filterImgUrls.length > 0
    result.hasVideo = videoUrls.length > 0
    return result
  }

  sendApproval(params, traceId?: string ) {
    const { content, bizData, previewUrl, imgUrls, videoUrls } = params
    const sensitiveWordCheckUrl = this.configService.get<string>(
      'XIAOJU_SURVEY_SENSITIVE_WORD_CHECK_URL',
    )
    return new Promise(resolve => {
      const data = {
        tag: 'PH_FORQ',
        content,
        previewUrl,
        bizData: JSON.stringify(bizData),
        urls: imgUrls,
        videoUrls,
        id: bizData.actId,
      }
      fetch(sensitiveWordCheckUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json, */*',
          'Content-Type': 'application/json',
          timeout: '1001',
          'didi-header-rid': traceId,
        },
        body: JSON.stringify(data),
      }).then((res) => {
        try {
          // res = JSON.parse(res)
          const code = _.get(res, 'data.code')
          let isBase = false
          const keys = _.get(res, 'data.extendResult', [])
          for (const v of keys) {
            if (v.label === 'base') {
              isBase = true
            }
          }
          if (code === 100000 || !isBase) {
            
            resolve({
              success: true,
              keys,
            })
          } else {
            
            resolve({
              success: false,
              code: _.get(res, 'data.code'),
              msg: _.get(res, 'data'),
              keys,
            })
          }
        } catch (e) {
          resolve({
            sucess: false,
            code: 100100,
            msg: JSON.stringify(e),
          })
        }
      }).catch((error) => {
        resolve({
          success: false,
          code: 100100,
          msg: JSON.stringify(error.message),
        })
      });

    })
  }

  create({ surveyId, userId, version, conAuditStatus }) {
    const curStatus = {
      status: APPROVAL_STATUS.NEW,
      date: Date.now(),
    };
    const auditStatus = {
      status: conAuditStatus || 'new',
      date: Date.now(),
    }
    const approval = this.approvalRepository.create({
      surveyId,
      userId,
      curStatus,
      statusList: [curStatus], // 送审记录的状态变更记录
      auditInfo: ['consec'],
      consec: {
        version, // 理论上问卷每次修改或者发布都要有一次version，但是目前没有version的设计，改成记录内容的hash
        requiredCallback: false, // 需要等待回调才能进入下一步
        status: auditStatus, // 当前审核状态，枚举值有 new、auditing、approved、rejected
        statusList: [auditStatus],
      },
    });
    return this.approvalRepository.save(approval);
  }

  findOne(id) {
    return this.approvalRepository.findOne({
      where: {
        _id: new ObjectId(id),
      },
    });
  }

  updateRequiredCallbackAnd({id, requiredCallback} ) {
    return this.approvalRepository.updateOne(
      {
        _id: new ObjectId(id),
      },
      {
        $set: {
          'consec.requiredCallback': requiredCallback,
        },
      },
    )
  }
  async updateConSecStatus({ id, status }) {
    return await this.approvalRepository.updateOne({
        _id: new ObjectId(id),
      }, 
      {
        $set: {
          'consec.status': status,
        },
      }
    )
  }
  async getBySurveyId({ surveyId }) {
    return await this.approvalRepository.findOne({
      where: {
        surveyId,
      }
    })
  }

  async isAuditFreezeQuestion({ surveyId, isNeedAuditRecord = false }) {
    const auditRes = await this.getBySurveyId({ surveyId })
    if (isNeedAuditRecord) {
      if (!auditRes) {
        throw new Error('当前问卷必须存在审核单')
      }
    }
    if ((auditRes.consec as any).requiredCallback) {
      const status = (auditRes.consec as any).status
      if (!['approved', 'rejected'].includes(status?.status || status)) {
        return true
      }
    }
    return false
  }
}
