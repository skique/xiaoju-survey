// 状态类型
export enum RECORD_STATUS {
  NEW = 'new', // 新建 | 未发布
  PUBLISHED = 'published', // 发布
  EDITING = 'editing', // 编辑
  FINISHED = 'finished', // 已结束
  REMOVED = 'removed',
  AUDITING = 'auditing',
  REJECTED = 'rejected'
}

export const enum RECORD_SUB_STATUS {
  DEFAULT = '', // 默认
  PAUSING = 'pausing', // 暂停
}

// 历史类型
export enum HISTORY_TYPE {
  DAILY_HIS = 'dailyHis', //保存历史
  PUBLISH_HIS = 'publishHis', //发布历史
}


// 审核状态枚举： new、auditing、approved、rejected
export enum APPROVAL_STATUS {
  NEW = 'new', // 新建 | 未发布
  AUDITING = 'auditing',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}
