<template>
  <el-form-item class="slider-wrap">
    <el-slider :value="formConfig.value" @input="changeData"></el-slider>
  </el-form-item>
</template>
<script>
import { FORM_CHANGE_EVENT_KEY } from '@/materials/setters/constant';
export default {
  name: 'SliderSetter',
  props: {
    formConfig: {
      type: Object,
      required: true,
    },
  },
  methods: {
    changeData(value) {
      const key = this.formConfig.key;
      this.$emit(FORM_CHANGE_EVENT_KEY, {
        key,
        value,
      });
    },
  },
};
</script>
<style>
.slider-wrap{
  flex: 1;
  padding: 0 20px;
}
</style>