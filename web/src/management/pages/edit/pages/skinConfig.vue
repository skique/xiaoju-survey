<template>
  <div class="skin-content">
    <div class="navbar-tab"> 
      <el-radio-group size="mini" style="margin-bottom: 30px;" v-for="btnItem in btnList" v-model="activeRouter">
        <el-radio-button :label="btnItem.router" :key="btnItem.router">
          <!-- <router-link
            :key="btnItem.router"
            :to="{ name: btnItem.router }"
            tag="span"
            replace
          >
          <span>{{ btnItem.text }}</span>
          </router-link> -->
          <span>{{ btnItem.text }}</span>
        </el-radio-button>
      </el-radio-group>
    </div>
    <router-view slot="body"></router-view>
  </div>
</template>
<script>
export default {
  name: 'skinPage',
  props: {},
  data() {
    return {
      activeRouter: 'QuestionSkinSetting',
      btnList: [
        {
          text: '内容页',
          router: 'QuestionSkinSetting',
          key: 'skinsettings',
          next: true,
        },
        {
          text: '结果页',
          router: 'QuestionEditResultConfig',
          key: 'status',
        },
      ],
    };
  },
  watch: {
    activeRouter(val) {
      this.$router.push({ name: this.activeRouter})
    }
  },
};
</script>
<style lang="scss" scoped>
.skin-content {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;

  .navbar-tab {
    position: absolute;
    top: 10px;
    cursor: pointer;
    z-index: 9999;
    // .el-radio-button__inner{
    //   color: $primary-color;
    //   background-color: #fff;
    // }
  }
}
</style>
