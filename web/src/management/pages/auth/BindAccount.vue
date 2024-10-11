<template>
  <div class="auth-container">
    <div v-if="!showForm" class="button-group">
      <div class="btn" @click="onBindAccountClick">绑定已有账号</div>
      <div class="btn" @click="onRegisterClick">注册新账号</div>
    </div>
    <div v-else class="bind-form">
      <el-form :model="formData" size="large">
        <el-form-item>
          <el-input v-model="formData.username" placeholder="请输入账号"></el-input>
        </el-form-item>
        <el-form-item>
          <el-input v-model="formData.password" placeholder="请输入密码" show-password></el-input>
        </el-form-item>
        <el-form-item class="form-buttons">
          <el-button class="btn" @click="onCancel">取消</el-button>
          <el-button class="btn" type="primary" @click="onConfirm">{{ formType === 'bind' ? '绑定' : '注册' }}</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { registerExternalUser, bindUser } from '@/management/api/auth'
import { CODE_MAP } from '@/management/api/base'
import { useUserStore } from '@/management/stores/user'

const route = useRoute()
const router = useRouter()

const { eid, username } = route.query

const showForm = ref(false)
const formType = ref('')
const formData = ref({
  username: '',
  password: ''
})

const onBindAccountClick = () => {
  showForm.value = true
  formType.value = 'bind'
}

const onRegisterClick = () => {
  formData.value.username = username as string
  showForm.value = true
  formType.value = 'register'
}

const onConfirm = async () => {
  let res: Record<string, any>
  const data = { eid, username: formData.value.username, password: formData.value.password };
  if (formType.value === 'bind') {
    // 绑定账号
    res = await bindUser(data)
  } else {
    // 注册新账号
    res = await registerExternalUser(data)
  }
  if (res.code === CODE_MAP.SUCCESS) {

    const userStore = useUserStore()
    userStore.login({
      username: res.data.username,
      token: res.data.token
    })
    router.replace({ name: 'survey' })

  } else {
    ElMessage.error(res.message)
  }
}

const onCancel = () => {
  showForm.value = false
}
</script>

<style lang="scss" scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  flex-direction: column;
  background: url("/imgs/create/background.webp") right bottom / cover no-repeat;
}

.button-group {
  display: flex;
  flex-direction: column;
  padding: 50px;
  background: #fff;
  border-radius: 6px;
  justify-content: center;
  align-items: center;
  box-shadow: #ddd 0 0 10px;
  .btn {
    width: 300px;
    height: 40px;
    line-height: 40px;
    border-radius: 4px;
    background-color: $primary-color;
    color: #fff;
    text-align: center;
    font-size: 16px;
    cursor: pointer;
    &:first-child {
      margin-bottom: 24px;
    }
  }
}

.bind-form {
  padding: 60px 50px 50px 50px;
  background-color: #fff;
  box-shadow: #ddd 0 0 10px;
  border-radius: 6px;
}

.form-buttons {
  .btn {
    width: 130px;
  }
}
</style>
