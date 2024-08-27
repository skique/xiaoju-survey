import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { defineStore } from 'pinia'
import { pick } from 'lodash-es'

import { isMobile as isInMobile } from '@/render/utils/index'
import { getEncryptInfo as getEncryptInfoApi } from '@/render/api/survey'
import { useQuestionStore } from '@/render/stores/question'
import { useErrorInfo } from '@/render/stores/errorInfo'

import moment from 'moment'
// 引入中文
import 'moment/locale/zh-cn'
// 设置中文


import adapter from '../adapter'
import { RuleMatch } from '@/common/logicEngine/RulesMatch'
import useCommandComponent from '../hooks/useCommandComponent'
import BackAnswerDialog from '../components/BackAnswerDialog.vue'

const confirm = useCommandComponent(BackAnswerDialog)

moment.locale('zh-cn')
/**
 * CODE_MAP不从management引入，在dev阶段，会导致B端 router被加载，进而导致C端路由被添加 baseUrl: /management
 */
const CODE_MAP = {
  SUCCESS: 200,
  ERROR: 500,
  NO_AUTH: 403
}


export const useSurveyStore = defineStore('survey', () => {
  const surveyPath = ref('')
  const isMobile = ref(isInMobile())
  const enterTime = ref(0)
  const encryptInfo = ref(null)
  const rules = ref({})
  const bannerConf = ref({})
  const baseConf = ref({})
  const bottomConf = ref({})
  const dataConf = ref({})
  const skinConf = ref({})
  const submitConf = ref({})
  const formValues = ref({})
  const whiteData = ref({})
  const pageConf = ref([])
  

  const router = useRouter()
  const questionStore = useQuestionStore()
  const { setErrorInfo } = useErrorInfo()

  const setWhiteData = (data) => {
    whiteData.value = data
  }

  const setSurveyPath = (data) => {
    surveyPath.value = data
  }

  const setEnterTime = () => {
    enterTime.value = Date.now()
  }

  const getEncryptInfo = async () => {
    try {
      const res = await getEncryptInfoApi()
      if (res.code === CODE_MAP.SUCCESS) {
        encryptInfo.value = res.data
      }
    } catch (error) {
      console.log(error)
    }
  }

  const canFillQuestionnaire = (baseConf, submitConf) => {
    const { begTime, endTime, answerBegTime, answerEndTime } = baseConf
    const { msgContent } = submitConf
    const now = Date.now()
    let isSuccess = true

    if (now < new Date(begTime).getTime()) {
      isSuccess = false
      setErrorInfo({
        errorType: 'overTime',
        errorMsg: `<p>问卷未到开始填写时间，暂时无法进行填写<p/>
                   <p>开始时间为: ${begTime}</p>`
      })
    } else if (now > new Date(endTime).getTime()) {
      isSuccess = false
      setErrorInfo({
        errorType: 'overTime',
        errorMsg: msgContent.msg_9001 || '您来晚了，感谢支持问卷~'
      })
    } else if (answerBegTime && answerEndTime) {
      const momentNow = moment()
      const todayStr = momentNow.format('yyyy-MM-DD')
      const momentStartTime = moment(`${todayStr} ${answerBegTime}`)
      const momentEndTime = moment(`${todayStr} ${answerEndTime}`)
      if (momentNow.isBefore(momentStartTime) || momentNow.isAfter(momentEndTime)) {
        isSuccess = false
        setErrorInfo({
          errorType: 'overTime',
          errorMsg: `<p>不在答题时间范围内，暂时无法进行填写<p/>
                    <p>答题时间为: ${answerBegTime} ~ ${answerEndTime}</p>`
        })
      }
    }

    if (!isSuccess) {
      router.push({ name: 'errorPage' })
    }

    return isSuccess
  }



  // 加载空白页面
  function clearFormData(option) {
    // 根据初始的schema生成questionData, questionSeq, rules, formValues, 这四个字段
    const {
      questionData,
      questionSeq,
      rules: _rules,
      formValues: _formValues
    } = adapter.generateData(
      pick(option, [
        'bannerConf',
        'baseConf',
        'bottomConf',
        'dataConf',
        'skinConf',
        'submitConf',
        'whiteData',
        'pageConf'
      ])
    )
    // todo: 建议通过questionStore提供setqueationdata方法修改属性，否则不好跟踪变化
    questionStore.questionData = questionData
    questionStore.questionSeq = questionSeq

    // 将数据设置到state上
    rules.value = _rules
    bannerConf.value = option.bannerConf
    baseConf.value = option.baseConf
    bottomConf.value = option.bottomConf
    dataConf.value = option.dataConf
    skinConf.value = option.skinConf
    submitConf.value = option.submitConf
    formValues.value = _formValues
    whiteData.value = option.whiteData
    pageConf.value = option.pageConf
    
    // 获取已投票数据
    questionStore.initVoteData()
    questionStore.initQuotaMap()

  }

  // 加载上次填写过的数据到问卷页
  function loadFormData(params, formData) {
    // 根据初始的schema生成questionData, questionSeq, rules, formValues, 这四个字段
    const { questionData, questionSeq, rules:_rules, formValues: _formValues } = adapter.generateData({
      bannerConf: params.bannerConf,
      baseConf: params.baseConf,
      bottomConf: params.bottomConf,
      dataConf: params.dataConf,
      skinConf: params.skinConf,
      submitConf: params.submitConf,
    })

    for(const key in formData){
      _formValues[key] = formData[key]
    }

    // todo: 建议通过questionStore提供setqueationdata方法修改属性，否则不好跟踪变化
    questionStore.questionData = questionData
    questionStore.questionSeq = questionSeq

    // 将数据设置到state上
    rules.value = _rules
    bannerConf.value = params.bannerConf
    baseConf.value = params.baseConf
    bottomConf.value = params.bottomConf
    dataConf.value = params.dataConf
    skinConf.value = params.skinConf
    submitConf.value = params.submitConf
    formValues.value = _formValues

    whiteData.value = params.whiteData
    pageConf.value = params.pageConf
    
    // 获取已投票数据
    questionStore.initVoteData()
    questionStore.initQuotaMap()

  }
  const initSurvey = (option) => {

    setEnterTime()
    if (!canFillQuestionnaire(option.baseConf, option.submitConf)) {
      return
    }

    const { breakAnswer, backAnswer } = option.baseConf

    const localData = JSON.parse(localStorage.getItem(surveyPath.value + "_questionData"))
    for(const key in localData){
      localData[key] = decodeURIComponent(localData[key])
    }

    const isSubmit = JSON.parse(localStorage.getItem('isSubmit'))
    if(localData) {
      if(isSubmit){
        if(!backAnswer) {
          clearFormData(option)
        } else {
          confirm({
            title: "您之前已提交过问卷，是否要回填？",
            onConfirm: async () => {
              try {
                loadFormData(option, localData)
              } catch (error) {
                console.log(error)
              } finally {
                confirm.close()
              }
            },
            onCancel: async() => {
              try {
                clearFormData(option)
              } catch (error) {
                console.log(error)
              } finally {
                confirm.close()
              }
            }
          })
        }
      } else {
        if(!breakAnswer) {
          clearFormData(option)
        } else {
          confirm({
            title: "您之前已填写部分内容, 是否要继续填写?",
            onConfirm: async () => {
              try {
                loadFormData(option, localData)
              } catch (error) {
                console.log(error)
              } finally {
                confirm.close()
              }
            },
            onCancel: async() => {
              try {
                clearFormData(option)
              } catch (error) {
                console.log(error)
              } finally {
                confirm.close()
              }
            }
          })
        }
      }
    } else {
      clearFormData(option)
    }
  }

  // 用户输入或者选择后，更新表单数据
  const changeData = (data) => {
    let { key, value } = data
    if (key in formValues.value) {
      formValues.value[key] = value
    }
    questionStore.setChangeField(key)
  }

  const showLogicEngine = ref()
  const initShowLogicEngine = (showLogicConf) => {
    showLogicEngine.value = new RuleMatch().fromJson(showLogicConf)
  }
  const jumpLogicEngine = ref()
  const initJumpLogicEngine = (jumpLogicConf) => {
    jumpLogicEngine.value = new RuleMatch().fromJson(jumpLogicConf)
  }

  return {
    surveyPath,
    isMobile,
    enterTime,
    encryptInfo,
    rules,
    bannerConf,
    baseConf,
    bottomConf,
    dataConf,
    skinConf,
    submitConf,
    formValues,
    whiteData,
    pageConf,
    initSurvey,
    changeData,
    setWhiteData,
    setSurveyPath,
    setEnterTime,
    getEncryptInfo,
    showLogicEngine,
    initShowLogicEngine,
    jumpLogicEngine,
    initJumpLogicEngine
  }
})
