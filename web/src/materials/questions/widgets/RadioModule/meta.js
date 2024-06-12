import basicConfig from '@materials/questions/common/config/basicConfig'

const meta = {
  title: '单选',
  type: 'radio',
  componentName: 'RadioModule',
  props: [
    {
      name: 'title',
      propType: 'String',
      description: '这是用于描述题目标题',
      defaultValue: '标题一'
    },
    {
      name: 'type',
      propType: 'String',
      description: '这是用于描述题目类型',
      defaultValue: '标题一'
    },
    {
      name: 'extraOptions',
      propType: Array,
      description: '这是用于固定选项配置',
      defaultValue: []
    }
  ],
  formConfig: [
    basicConfig,
    {
      name: 'optionLimit',
      label: '选项配额',
      labelStyle: {
        'font-weight': 'bold'
      },
      type: 'DialogSetter',
      // 输出转换
      setterAdapter({ options, limitRevert, limitNoDisplay}) {
        return [{
          key: 'options',
          value: options
        },
        {
          key: 'limitRevert',
          value: limitRevert
        },
        {
          key: 'limitNoDisplay',
          value: limitNoDisplay
        }]
      }
    },
  ],
  editConfigure: {
    optionEdit: {
      show: true
    },
    optionEditBar: {
      show: true,
      configure: {
        showOthers: true,
        showAdvancedConfig: true
      }
    }
  }
}

export default meta
