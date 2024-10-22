<template>
  <div class="navbar-main-logo" @click="handleNavigate">
    <img :src="singleLogo" />
  </div>
</template>
<script setup lang="ts">
import { useRouter } from 'vue-router'
import { singleLogo } from '@/management/config/logo'
const router = useRouter()

const handleNavigate = () => {
  router.push({ name: 'survey' })
}
</script>
<style lang="scss" scoped>
.navbar-main-logo {
  width: 80px;
  height: 56px;
  display: flex;
  justify-content: center;
  align-items: center;

  :hover {
    cursor: pointer;
  }

  img {
    width: 32px;
  }
}
</style>
