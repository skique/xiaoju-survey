import * as _ from 'lodash'
import { cleanRichText, parse } from 'src/utils/string'
import { customAlphabet } from 'nanoid';


export class ApprovalPlugin  {
  surveyConf: any
  surveyMeta: any
  constructor({surveyConf, surveyMeta}) {
    this.surveyConf = surveyConf
    this.surveyMeta = surveyMeta
  }
  getAuditData() {
    const content: Array<any> = [] // 送审的文本内容
    const imgUrls: Array<any> = [] // 送审的图片链接
    const videoUrls: Array<any> = [] // 送审的视频链接
  
    content.push(_.get(this.surveyMeta, 'title'))
    content.push(_.get(this.surveyMeta, 'remark'))
    const mainTitle = _.get(this.surveyConf, 'bannerConf.titleConfig.mainTitle')
    const subTitle = _.get(this.surveyConf, 'bannerConf.titleConfig.subTitle')
    content.push(cleanRichText(mainTitle))
    content.push(cleanRichText(subTitle))
  
    const bannerBgImg = _.get(this.surveyConf, 'bannerConf.bannerConfig.bgImage')
    if (bannerBgImg) {
      imgUrls.push(bannerBgImg)
    }
  
    const logoImg = _.get(this.surveyConf, 'bottomConf.logoImage')
    if (logoImg) {
      imgUrls.push(logoImg)
    }
  
   ( _.get(this.surveyConf, 'dataConf.dataList') as []).forEach((item: any) => {
      const { content: mainTitle, imgUrls: mainImgUrls, videoUrls: mainVideoUrls } = parse(item.title)
      content.push(mainTitle)
      imgUrls.push(...mainImgUrls)
      videoUrls.push(...mainVideoUrls)
  
      content.push(item.placeholder)
      
      const options = _.get(item, 'options')
      if (Array.isArray(options)) {
        options.forEach(option => {
          const { content: optionText, imgUrls: optionImgUrls, videoUrls: optionVideoUrls } = parse(option.text)
          content.push(optionText)
          imgUrls.push(...optionImgUrls)
          videoUrls.push(...optionVideoUrls)
        })
      }
    })
  
    return {
      content: content.filter(item => item).join('\n'),
      imgUrls,
      videoUrls,
    }
  }
  getAuditVersion() {
    const approvalVersionAlphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    const id = customAlphabet(approvalVersionAlphabet, 8);
    const version = id()
    return version
  }
}
