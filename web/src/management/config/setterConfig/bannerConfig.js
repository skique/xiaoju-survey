export default [
  {
    label: '顶部图片地址',
    type: 'Input',
    key: 'bgImage',
    inline: true,
    direction: 'horizon',
    labelStyle: { width: '120px' }
  },
  {
    label: '顶部视频地址',
    type: 'Input',
    key: 'videoLink',
    direction: 'horizon',
    labelStyle: { width: '120px' }
  },
  {
    label: '视频海报地址',
    type: 'Input',
    key: 'postImg',
    direction: 'horizon',
    labelStyle: { width: '120px' }
  },
  {
    label: '图片支持点击',
    type: 'CustomedSwitch',
    direction: 'horizon',
    labelStyle: { width: '120px' },
    key: 'bgImageAllowJump',
  },
  {
    label: '跳转链接',
    type: 'Input',
    direction: 'horizon',
    labelStyle: { width: '120px' },
    key: 'bgImageJumpLink',
    relyFunc: (data) => {
      return !!data?.bgImageAllowJump;
    },
  },
];
