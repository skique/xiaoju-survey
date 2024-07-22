<template>
  <QuestionRuleContainer
    v-if="!jumpSkip"
    :moduleConfig="questionConfig"
    :indexNumber="indexNumber"
    :showTitle="true"
    @change="handleChange"
  ></QuestionRuleContainer>
</template>
<script setup>
import { unref, ref, computed, watch, nextTick } from 'vue'
import QuestionRuleContainer from '../../materials/questions/QuestionRuleContainer'
import { useVoteMap } from '@/render/hooks/useVoteMap'
import { useShowOthers } from '@/render/hooks/useShowOthers'
import { useShowInput } from '@/render/hooks/useShowInput'
import { cloneDeep } from 'lodash-es'
import { ruleEngine } from '@/render/hooks/useRuleEngine.js'
import { useQuestionStore } from '../stores/question'
import { useSurveyStore } from '../stores/survey'

import { NORMAL_CHOICES, RATES, QUESTION_TYPE } from '@/common/typeEnum.ts'
import { getQuestionIndexByField, findMinKeyInMap } from '@/render/utils/index.js'

const props = defineProps({
  indexNumber: {
    type: [Number, String],
    default: 1
  },
  moduleConfig: {
    type: Object,
    default: () => {
      return {}
    }
  },
  qIndex: {
    type: Number,
    default: 0
  }
})
const emit = defineEmits(['change'])
const questionStore = useQuestionStore()
const surveyStore = useSurveyStore()

const formValues = computed(() => {
  return surveyStore.formValues
})
const questionConfig = computed(() => {
  let moduleConfig = props.moduleConfig
  const { type, field, options = [], ...rest } = cloneDeep(moduleConfig)
  // console.log(field,'这里依赖的formValue，所以change时会触发重新计算')
  let alloptions = options
  if (type === QUESTION_TYPE.VOTE) {
    const { options, voteTotal } = useVoteMap(field)
    const voteOptions = unref(options)
    alloptions = alloptions.map((obj, index) => Object.assign(obj, voteOptions[index]))
    moduleConfig.voteTotal = unref(voteTotal)
  }
  if (
    NORMAL_CHOICES.includes(type) &&
    options.filter((optionItem) => optionItem.others).length > 0
  ) {
    let { options, othersValue } = useShowOthers(field)
    const othersOptions = unref(options)
    alloptions = alloptions.map((obj, index) => Object.assign(obj, othersOptions[index]))
    moduleConfig.othersValue = unref(othersValue)
  }
  if (
    RATES.includes(type) &&
    rest?.rangeConfig &&
    Object.keys(rest?.rangeConfig).filter((index) => rest?.rangeConfig[index].isShowInput).length >
      0
    RATES.includes(type) &&
    rest?.rangeConfig &&
    Object.keys(rest?.rangeConfig).filter((index) => rest?.rangeConfig[index].isShowInput).length >
      0
  ) {
    let { rangeConfig, othersValue } = useShowInput(field)
    moduleConfig.rangeConfig = unref(rangeConfig)
    moduleConfig.othersValue = unref(othersValue)
  }

  return {
    ...moduleConfig,
    options: alloptions,
    value: formValues.value[props.moduleConfig.field]
  }
})

// const showMatch = computed(() => {
//   // computed有计算缓存，当match有变化的时候触发重新计算
//   const result = ruleEngine.match(props.moduleConfig.field, 'question', formValues.value)
//   // console.log({field, result})
//   return result === undefined ? true : result
// })

// watch(
//   () => showMatch.value,
//   (newVal, oldVal) => {
//     // 题目从显示到隐藏，需要清空值
//     const { field, type, innerType } = props.moduleConfig
//     if (!newVal && oldVal) {
//       console.log(field,'题目隐藏了')
//       let value = ''
//       // 题型是多选，或者子题型是多选（innerType是用于投票）
//       if (type === QUESTION_TYPE.CHECKBOX || innerType === QUESTION_TYPE.CHECKBOX) {
//         value = value ? [value] : []
//       }
//       const data = {
//         key: field,
//         value: value
//       }
//       store.commit('changeFormData', data)
//     }
//   }
// )


const jumpSkip = ref(false)
const changeIndex = computed(() => {
  return getQuestionIndexByField(store.state.dataConf.dataList, store.state.changeField)
})

// 监听formValues变化，判断当前题目是否需要跳过
watch(()=> formValues,
 (newVal, oldVal) => {
  const currentIndex = props.qIndex
  // 找到当前题关联的目标题
  const targets = ruleEngine.findTargetsByField(store.state.changeField)
  // 计算目标题的命中情况
  const targetsResult = new Map()
  targets.forEach(target => {
    const index = getQuestionIndexByField(store.state.dataConf.dataList, target)
    targetsResult.set(index, ruleEngine.match(target, 'question', newVal.value, 'or'))
  })
  // const changeIndex = getQuestionIndexByField(store.state.dataConf.dataList, store.state.changeField)
  
  const jumpFitMinIndex = findMinKeyInMap(targetsResult, true)
  // console.log({targets, targetsResult, jumpFitMinIndex})
  if(currentIndex < changeIndex.value) {
    return
  }
  if(changeIndex.value <  currentIndex &&  currentIndex < jumpFitMinIndex) {
    jumpSkip.value = true
    nextTick(() => {
      console.log(`题目${currentIndex + 1}被跳过了，如果该题关联了跳题，则需要重置它的跳题`)
    })
  } else {
    jumpSkip.value = false
  }
  console.log({targets, targetsResult, jumpFitMinIndex, changeIndex: changeIndex.value, currentIndex, jumpSkip: jumpSkip.value})
}, {deep: true})

const handleChange = (data) => {
  emit('change', data)
  // 处理投票题
  if (props.moduleConfig.type === QUESTION_TYPE.VOTE) {
    questionStore.updateVoteData(data)
  }
}
</script>
