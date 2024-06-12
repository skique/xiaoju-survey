<template>
  <el-table :data="value" style="width: 100%">
    <el-table-column label="选项" width="180">
      <template #default="scope">
        <el-popover effect="light" trigger="hover" placement="top" width="auto">
          <template #default>
            <div v-safe-html="scope.row.text"></div>
          </template>
          <template #reference>
            <div class="ellipsis" v-plain-text="scope.row.text"></div>
          </template>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column label="配额设置">
      <template #default="scope">
        <el-input-number v-model="scope.row.limit"/>
      </template>
    </el-table-column>
  </el-table>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'
interface Option {
  text: string
  limit: string
}

interface Props {
  modelValue?: Option[]
}
const props = withDefaults(defineProps<Props>(), {
  modelValue: [
    {
      text: '选项1',
      limit: 1
    },
    {
      text: '选项2',
      limit: 1
    }
  ]
})
const emit = defineEmits(['update:modelValue'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

</script>
<style>
.ellipsis{
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>