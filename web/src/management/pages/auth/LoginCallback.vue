<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/management/stores/user'

const route = useRoute()
const router = useRouter()
if (!route.query.token || !route.query.username) {
  router.replace({ name: 'login' })
} else {
  const userStore = useUserStore()
  userStore.login({
    username: route.query.username.toString(),
    token: route.query.token.toString(),
  })
  let redirect: any = {
    name: 'survey'
  }
  if (route.query.redirect) {
    redirect = decodeURIComponent(route.query.redirect as string)
  }
  router.replace(redirect)
}

</script>

<style></style>