<template>
   <el-button :class="class" type="primary" link @click="dialogVisible = true">
      设置
    </el-button>

    <el-dialog
      v-model="dialogVisible"
      :title="formConfig.label"
      width="500"
      :before-close="handleClose"
    >
      <OptionLimitEdit v-model="options"></OptionLimitEdit> 
      <br />
      <el-checkbox v-model="limitRevert">删除后恢复选项配额</el-checkbox>
      <br />
      <el-checkbox v-model="limitNoDisplay">不展示配额剩余数量</el-checkbox>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleConfirm">
            确定
          </el-button>
        </div>
      </template>
    </el-dialog>
</template>
<script lang="ts" setup>
import { ref } from 'vue'
import { FORM_CHANGE_EVENT_KEY } from '@/materials/setters/constant'
import OptionLimitEdit from './OptionLimitEdit.vue'

interface Option {
  text: string
  limit: string
}

interface Props {
  class: string,
  formConfig: any,
  moduleConfig: any
}

interface Emit {
  (ev: typeof FORM_CHANGE_EVENT_KEY, arg: { options: Option[]; limitRevert: boolean, limitNoDisplay: boolean }): void
}

const props = withDefaults(defineProps<Props>(), {
  class: '',
  formConfig: {},
  moduleConfig: {
    options: [
      {
        text: '选项1',
        limit: 1
      },
      {
        text: '选项2',
        limit: 1
      }
    ]
  }
})
const emit = defineEmits([FORM_CHANGE_EVENT_KEY])
const options = ref<Option[]>(props.moduleConfig.options)
const limitRevert = ref(props.moduleConfig.limitRevert)
const limitNoDisplay = ref(props.moduleConfig.limitNoDisplay)

const dialogVisible = ref(false)
const handleConfirm = () => {
  // 更新配置
  dialogVisible.value = false
  emit(FORM_CHANGE_EVENT_KEY, {
    options: options.value,
    limitRevert: limitRevert.value,
    limitNoDisplay: limitNoDisplay.value
  })
}
const handleClose = () => {
  // reset配置
  dialogVisible.value = false
}
</script>