<template>
  <el-tabs  v-model="activeName" class="loigc-tabs" @tab-click="handleClick">
    <el-tab-pane label="显示逻辑" name="showLogic">
      <LogicEditPage/>
    </el-tab-pane>
    <el-tab-pane label="跳转逻辑" name="jumpLogic" class="logic-wrapper">
      <jumpLogicPage/>
    </el-tab-pane>
  </el-tabs>
</template>
<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import LogicEditPage from './LogicEditPage.vue'
import jumpLogicPage from './jumpLogicPage.vue'

const activeName = ref('jumpLogic')

const handleClick = () => {
  console.log('click')
}
</script>
<style lang="scss" scoped>
.loigc-tabs{
  width: 98%;
  height: calc(100% - 48px);
  padding: 10px;
  position: relative;
  top: 24px;
  
  background-color: #fff;
  :deep(.el-tabs__content ){
    height: calc(100% - 10px ); 
    padding-bottom: 10px;
    :deep(el-tab-pane){
      height: 100%; 
      overflow: auto;
    }
  }
}
</style>
