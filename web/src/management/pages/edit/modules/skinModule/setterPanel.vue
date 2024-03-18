<template>
  <div class="setter-wrapper">
    <div class="setter-title">
      样式设置
    </div>
  </div>
</template>
<script setup>

</script>
<style lang="scss" rel="stylesheet/scss" scoped>
.setter-wrapper {
  width: 360px;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: #fff;
}

.setter-title {
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: $primary-color;
  padding-left: 20px;
  background: #f9fafc;
  border-bottom: 1px solid #edeffc;
}

.no-select-question {
  padding-top: 125px;
  display: flex;
  flex-direction: column;
  align-items: center;

  img {
    width: 160px;
    padding: 25px;
  }

  .tip {
    font-size: 14px;
    color: $normal-color;
    letter-spacing: 0;
  }
}

.question-config-form {
  padding: 30px 20px 50px 20px;
}
</style>
