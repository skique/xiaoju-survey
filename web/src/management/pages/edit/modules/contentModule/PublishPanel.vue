<template>
  <el-button type="primary" :loading="isPublishing" class="publish-btn" @click="handlePublish">
    发布
  </el-button>
</template>
<script setup lang="ts">
import { ref, computed, watch, toRaw } from 'vue'
import { useEditStore } from '@/management/stores/edit'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox, type Action } from 'element-plus'
import 'element-plus/theme-chalk/src/message.scss'
import { publishSurvey, saveSurvey, approvalStatus } from '@/management/api/survey'
import buildData from './buildData'
import { storeToRefs } from 'pinia'
import { CODE_MAP } from '@/management/api/base'
import { get } from 'lodash-es'
interface Props {
  updateLogicConf: any
  updateWhiteConf: any
  seize: any
}

const props = defineProps<Props>()

const isPublishing = ref<boolean>(false)
const editStore = useEditStore()
const { getSchemaFromRemote } = editStore
const { schema, sessionId } = storeToRefs(editStore)
const saveData = computed(() => {
  return buildData(schema.value, sessionId.value)
})

const surveyStatus = computed(() => {
  const curStatus = get(schema.value, 'metaData.curStatus.status')
  console.log(curStatus)
  return curStatus
})


const router = useRouter()

const validate = () => {
  let checked = true
  let msg = ''
  const { validated, message } = props.updateLogicConf()
  if (!validated) {
    checked = validated
    msg = `检查页面"问卷编辑>显示逻辑"：${message}`
  }
  const { validated: whiteValidated, message: whiteMsg } = props.updateWhiteConf()
  if (!whiteValidated) {
    checked = whiteValidated
    msg = `检查页面"问卷设置>作答限制"：${whiteMsg}`
  }

  return {
    checked,
    msg
  }
}

const onSave = async () => {
  if (!saveData.value.sessionId) {
    ElMessage.error('未获取到sessionId')
    return null
  }
  if (!saveData.value.surveyId) {
    ElMessage.error('未获取到问卷id')
    return null
  }

  try {
    const res: any = await saveSurvey(saveData.value)
    if (!res) {
      return null
    }
    if (res.code === 200) {
      ElMessage.success('保存成功')
      return res
    } else if (res.code === 3006) {
      ElMessageBox.alert(res.errmsg, '提示', {
        confirmButtonText: '刷新同步',
        callback: (action: string) => {
          if (action === 'confirm') {
            props.seize(sessionId.value)
          }
        }
      })
      return null
    } else {
      ElMessage.error(res.errmsg)
      return null
    }
  } catch (error) {
    ElMessage.error('保存问卷失败')
    return null
  }
}
const handlePublish = async () => {
  if (isPublishing.value) {
    return
  }

  isPublishing.value = true

  // 发布检测
  const { checked, msg } = validate()
  if (!checked) {
    isPublishing.value = false
    ElMessage.error(msg)
    return
  }

  try {
    const saveRes: any = await onSave()
    if (!saveRes || saveRes.code !== CODE_MAP.SUCCESS) {
      return
    }
    const publishRes: any = await publishSurvey({ surveyId: saveData.value.surveyId })
    if (publishRes.code === 200) {
      if(publishRes.success) {
          ElMessage.success('发布成功')
          getSchemaFromRemote()
          router.push({ name: 'publish' })
        } else {
          ElMessageBox.confirm('您的问卷需要经过人工审核后才能发布成功，请您耐心等待。', '提示', {
            confirmButtonText: '提交审核',
            cancelButtonText: '返回修改',
            type: 'warning'
          }).then(async () => {
            const res: any= await approvalStatus({ surveyId: saveData.value.surveyId })
            if(res.code === 200) {
              // 更新问卷状态为审核中
              getSchemaFromRemote()
            }
          }).catch(() => {
            console.log('返回修改')
          })
      }
    } else {
      ElMessage.error(`发布失败 ${publishRes.errmsg}`)
    }
  } catch (err) {
    ElMessage.error(`发布失败`)
  } finally {
    isPublishing.value = false
  }
}
  const showAuditingDialog = async () => {
    await ElMessageBox.alert('问卷已成功提交审核，请等待审核结果。暂时不可进行问卷编辑。', '提示', {
      confirmButtonText: '返回问卷列表',
      showClose: false,
      type: 'warning',
      callback: (action: Action) => {
        router.push('/')
      }
    })
  }

  watch(
    () => surveyStatus.value,
    (newVal) => {
      if(newVal === 'auditing') {
        showAuditingDialog()
      }
    },
    {
      immediate: true
    }
  )
</script>
<style lang="scss" scoped>
.publish-btn {
  width: 100px;
  font-size: 14px;
  height: 36px;
  line-height: 36px;
  padding: 0;
}
</style>
